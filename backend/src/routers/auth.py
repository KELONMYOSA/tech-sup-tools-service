from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from src.models.user import User
from src.utils.auth import create_tokens, get_current_user, get_current_user_refresh, ldap_login

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# Аутентификация пользователя и генерация токенов
@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):  # noqa: B008
    user = ldap_login(form_data.username.lower(), form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token, refresh_token = create_tokens({"sub": user.uid})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


# Обновление токена с использованием Refresh Token
@router.post("/refresh")
def refresh(refresh_token: str):
    user = get_current_user_refresh(refresh_token)
    access_token, refresh_token = create_tokens({"sub": user.uid})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


# Обновление токена с использованием Refresh Token
@router.get("/info")
def user_info(current_user: User = Depends(get_current_user)):  # noqa: B008
    return current_user
