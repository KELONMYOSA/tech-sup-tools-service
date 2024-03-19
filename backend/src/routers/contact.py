from fastapi import APIRouter, Depends, HTTPException, status

from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.company import get_contacts_by_company_id

router = APIRouter(
    prefix="/contact",
    tags=["Contact"],
)


# Поиск контактов по id компании
@router.get("/")
async def contacts_by_company_id(company_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_contacts_by_company_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contacts not found")
    return result
