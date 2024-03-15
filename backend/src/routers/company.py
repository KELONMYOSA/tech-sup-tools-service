from fastapi import APIRouter, Depends, HTTPException, status

from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.clients import get_company_by_id

router = APIRouter(
    prefix="/company",
    tags=["Company"],
)


# Поиск компании по id
@router.get("/{company_id}")
async def company_by_id(company_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_company_by_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return result
