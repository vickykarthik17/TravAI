import base64
import hashlib
import hmac
import secrets
import time
from typing import Optional

from app.config import settings


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt, digest = password_hash.split("$", 1)
    except ValueError:
        return False
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest() == digest


def create_access_token(user_id: int, email: str) -> str:
    issued_at = int(time.time())
    payload = f"{user_id}:{email}:{issued_at}"
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()
    raw = f"{payload}:{signature}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def decode_access_token(token: str) -> Optional[dict]:
    try:
        raw = base64.urlsafe_b64decode(token.encode()).decode()
        user_id, email, issued_at, signature = raw.rsplit(":", 3)
        payload = f"{user_id}:{email}:{issued_at}"
        expected = hmac.new(
            settings.SECRET_KEY.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return None
        if int(time.time()) - int(issued_at) > settings.ACCESS_TOKEN_EXPIRE_SECONDS:
            return None
        return {"user_id": int(user_id), "email": email}
    except Exception:
        return None
