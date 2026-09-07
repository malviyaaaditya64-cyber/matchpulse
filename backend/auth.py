"""
Authentication utilities: password hashing and JWT tokens.

Password hashing uses Python's built-in hashlib.pbkdf2_hmac — deliberately
avoiding bcrypt/passlib here because those need a C compiler on some
Windows setups and have caused installation headaches in this project
before. pbkdf2_hmac is part of the standard library, always available,
and secure enough for a student/demo project.

JWT uses PyJWT (pure Python, no compiled extensions, installs cleanly
everywhere).
"""

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt

# In a real production app this would come from an environment variable,
# never hardcoded. For this project, a fixed dev secret is fine.
SECRET_KEY = "dev-secret-change-this-in-production-8f3a1c9e"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Returns (password_hash, salt). Generates a new salt if none given."""
    if salt is None:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000
    ).hex()
    return pw_hash, salt


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    computed_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, expected_hash)


def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """Returns the username if the token is valid, raises jwt exceptions otherwise."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload["sub"]
