import json
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from ldap3 import ALL_ATTRIBUTES, Connection, Server

from src.config import settings
from src.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
ALGORITHM = "HS256"
SECRET_KEY = settings.SECRET_KEY
REFRESH_SECRET_KEY = settings.REFRESH_SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7


def _get_ldap_connection() -> Connection:
    server = Server(settings.LDAP_PROVIDER_HOST, settings.LDAP_PROVIDER_PORT, True)
    conn = Connection(
        server, settings.LDAP_PROVIDER_USER, settings.LDAP_PROVIDER_PASSWORD, "NO_TLS", authentication="SIMPLE"
    )
    return conn


# Получение пользователя из LDAP
def ldap_login(username: str, password: str) -> User | None:
    conn = _get_ldap_connection()
    found = conn.search("ou=users,ou=nss,dc=comfortel,dc=pro", f"(uid={username})")
    if not found:
        conn.unbind()
        return None
    response = json.loads(conn.response_to_json())
    user_dn = response["entries"][0]["dn"]
    found = conn.rebind(user_dn, password)
    if found:
        conn.search(user_dn, "(objectClass=person)", attributes=ALL_ATTRIBUTES)
        attr = json.loads(conn.response_to_json())["entries"][0]["attributes"]
        conn.unbind()
        return User(
            cn=attr["cn"][0] if "cn" in attr else None,
            gecos=attr.get("gecos"),
            mail=attr["mail"][0] if "mail" in attr else None,
            telephoneNumber=attr["telephoneNumber"][0] if "telephoneNumber" in attr else None,
            title=attr["title"][0] if "title" in attr else None,
            uid=attr["uid"][0] if "uid" in attr else None,
            gidNumber=attr.get("gidNumber", None),
        )
    else:
        conn.unbind()
        return None


# Получение пользователя из LDAP по uid
def __get_user_by_uid(username: str) -> User | None:
    conn = _get_ldap_connection()
    found = conn.search("ou=users,ou=nss,dc=comfortel,dc=pro", f"(uid={username})", attributes=ALL_ATTRIBUTES)
    if found:
        attr = json.loads(conn.response_to_json())["entries"][0]["attributes"]
        conn.unbind()
        return User(
            cn=attr["cn"][0] if "cn" in attr else None,
            gecos=attr.get("gecos"),
            mail=attr["mail"][0] if "mail" in attr else None,
            telephoneNumber=attr["telephoneNumber"][0] if "telephoneNumber" in attr else None,
            title=attr["title"][0] if "title" in attr else None,
            uid=attr["uid"][0] if "uid" in attr else None,
            gidNumber=attr.get("gidNumber", None),
        )
    else:
        conn.unbind()
        return None


# Генерация JWT токена
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


# Генерация Refresh Token
def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


# Генерация JWT токена и Refresh Token
def create_tokens(data: dict) -> tuple[str, str]:
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    return access_token, refresh_token


# Получение текущего пользователя из токена
def get_current_user(token: str = Depends(oauth2_scheme)) -> User | None:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception  # noqa: B904

    user = __get_user_by_uid(uid)
    if user is None:
        raise credentials_exception

    return user


# Получение текущего пользователя из Refresh Токена
def get_current_user_refresh(token: str = Depends(oauth2_scheme)) -> User | None:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception  # noqa: B904

    user = __get_user_by_uid(uid)
    if user is None:
        raise credentials_exception

    return user
