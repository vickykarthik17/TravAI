"""
MongoDB Atlas Async Connector for Nexgile-TravAI Portal
Cluster Target: cluster0.tf8lwiu.mongodb.net
Supports MongoDB Atlas SRV URI: mongodb+srv://<user>:<password>@cluster0.tf8lwiu.mongodb.net/?retryWrites=true&w=majority
"""
import os
import re
import urllib.parse
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("nexgile_travai.mongodb")

_mongo_client: Optional[AsyncIOMotorClient] = None

CLUSTER_HOST = "cluster0.tf8lwiu.mongodb.net"

def is_placeholder_uri(uri: str) -> bool:
    """Check if the URI still contains unpopulated username or password placeholders."""
    if not uri:
        return True
    return bool(
        "<db_username>" in uri or
        "<db_password>" in uri or
        "<username>" in uri or
        "<password>" in uri
    )

def sanitize_mongo_uri(uri: str) -> str:
    """Ensure username and password in a mongodb(+srv) URI are RFC 3986 escaped."""
    if not uri or is_placeholder_uri(uri):
        return uri
    match = re.match(r'^(mongodb(?:\+srv)?://)([^:]+):(.*)@([^/@]+)(/.*)?$', uri)
    if match:
        scheme, user, pwd, host, rest = match.groups()
        safe_user = urllib.parse.quote_plus(urllib.parse.unquote_plus(user))
        safe_pwd = urllib.parse.quote_plus(urllib.parse.unquote_plus(pwd))
        return f"{scheme}{safe_user}:{safe_pwd}@{host}{rest or ''}"
    return uri

def get_mongo_client() -> Optional[AsyncIOMotorClient]:
    """Retrieve or initialize the singleton AsyncIOMotorClient."""
    global _mongo_client
    if _mongo_client is None:
        raw_uri = settings.MONGODB_URI or os.getenv("MONGODB_URI", "")
        if raw_uri and not is_placeholder_uri(raw_uri):
            try:
                uri = sanitize_mongo_uri(raw_uri)
                _mongo_client = AsyncIOMotorClient(
                    uri,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000
                )
                logger.info(f"Initialized AsyncIOMotorClient for MongoDB Atlas cluster: {CLUSTER_HOST}")
            except Exception as e:
                logger.error(f"Failed to initialize AsyncIOMotorClient: {e}")
                _mongo_client = None
    return _mongo_client

def get_mongo_db() -> Optional[AsyncIOMotorDatabase]:
    """Retrieve the target database from MongoDB Atlas."""
    client = get_mongo_client()
    if client is not None:
        db_name = settings.MONGODB_DB_NAME or os.getenv("MONGODB_DB_NAME", "nexgile_travai")
        return client[db_name]
    return None

async def test_mongo_connection() -> Dict[str, Any]:
    """Ping MongoDB Atlas and check cluster connectivity."""
    uri = settings.MONGODB_URI or os.getenv("MONGODB_URI", "")
    
    if not uri or is_placeholder_uri(uri):
        return {
            "status": "credentials_required",
            "connected": False,
            "database_type": "MongoDB Atlas",
            "cluster_host": CLUSTER_HOST,
            "configured_uri_template": f"mongodb+srv://<db_username>:<db_password>@{CLUSTER_HOST}/?retryWrites=true&w=majority",
            "database_name": settings.MONGODB_DB_NAME,
            "message": f"Cluster target configured ({CLUSTER_HOST}). Please provide your MongoDB Atlas database username and password in backend/.env or via the Settings modal."
        }
    
    try:
        client = get_mongo_client()
        if not client:
            return {
                "status": "error",
                "connected": False,
                "cluster_host": CLUSTER_HOST,
                "message": "Failed to create AsyncIOMotorClient with the provided URI."
            }
        
        # Issue a ping command to confirm cluster connectivity
        result = await client.admin.command('ping')
        db = get_mongo_db()
        collections: List[str] = await db.list_collection_names() if db is not None else []
        
        return {
            "status": "connected",
            "connected": True,
            "database_type": "MongoDB Atlas",
            "cluster_host": CLUSTER_HOST,
            "ping": result.get("ok", 1),
            "cluster_database": settings.MONGODB_DB_NAME,
            "collections_count": len(collections),
            "collections": collections[:10],
            "message": f"Successfully connected to MongoDB Atlas cluster {CLUSTER_HOST}!"
        }
    except Exception as e:
        return {
            "status": "connection_failed",
            "connected": False,
            "cluster_host": CLUSTER_HOST,
            "error": str(e),
            "message": f"Could not connect to {CLUSTER_HOST}. Please verify username/password and that Network Access allows 0.0.0.0/0 in MongoDB Atlas."
        }

async def update_mongo_configuration(
    username: Optional[str] = None,
    password: Optional[str] = None,
    raw_uri: Optional[str] = None,
    db_name: Optional[str] = None
) -> Dict[str, Any]:
    """Update MongoDB Atlas configuration live and persist to backend/.env."""
    global _mongo_client
    
    target_db = db_name or settings.MONGODB_DB_NAME or "nexgile_travai"
    
    if raw_uri and not is_placeholder_uri(raw_uri):
        new_uri = sanitize_mongo_uri(raw_uri.strip())
    elif username and password:
        from urllib.parse import quote_plus
        safe_user = quote_plus(username.strip())
        safe_pwd = quote_plus(password.strip())
        new_uri = f"mongodb+srv://{safe_user}:{safe_pwd}@{CLUSTER_HOST}/?retryWrites=true&w=majority"
    else:
        return {
            "success": False,
            "message": "Please provide either a full connection URI or both username and password."
        }
    
    # Close existing client if any
    if _mongo_client is not None:
        try:
            _mongo_client.close()
        except Exception:
            pass
        _mongo_client = None
    
    # Update runtime settings
    settings.MONGODB_URI = new_uri
    settings.MONGODB_DB_NAME = target_db
    os.environ["MONGODB_URI"] = new_uri
    os.environ["MONGODB_DB_NAME"] = target_db
    
    # Persist to backend/.env
    try:
        backend_dir = Path(__file__).resolve().parent.parent
        env_path = backend_dir / ".env"
        env_content = f"MONGODB_URI={new_uri}\nMONGODB_DB_NAME={target_db}\n"
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(env_content)
        logger.info(f"Saved MongoDB configuration to {env_path}")
    except Exception as e:
        logger.warning(f"Could not persist to .env: {e}")
    
    # Test new connection
    test_res = await test_mongo_connection()
    return {
        "success": test_res.get("connected", False),
        "cluster_host": CLUSTER_HOST,
        "database_name": target_db,
        "test_result": test_res
    }
