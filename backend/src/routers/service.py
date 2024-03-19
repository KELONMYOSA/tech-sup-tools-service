from fastapi import APIRouter, Depends, HTTPException, status

from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.services import get_service_by_id

router = APIRouter(
    prefix="/service",
    tags=["Service"],
)


# Поиск услуги по id
@router.get("/{service_id}")
async def service_by_id(service_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result, data = get_service_by_id(service_id)
    if not result:
        if data == "NotFound!":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=data)
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=data)
    return data
