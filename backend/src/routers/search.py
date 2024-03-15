from fastapi import APIRouter, Depends, HTTPException, status

from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.clients import get_client_by_phone

router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


# Поиск компании по номеру телефона
@router.get("/company")
async def company_by_phone(phone: str, max_results: int = 10, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_client_by_phone(phone, max_results)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clients not found")
    return result
