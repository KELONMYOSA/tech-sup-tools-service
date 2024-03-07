from fastapi import APIRouter, Depends, HTTPException, status

from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.clients import get_client_by_phone, get_company_by_id, get_contacts_by_company_id
from src.utils.services import get_service_by_id, get_services_by_company_id

router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


# Поиск клиента по номеру телефона
@router.get("/client")
async def client_by_phone(phone: str, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_client_by_phone(phone)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong input format")
    return result


# Поиск компании по id
@router.get("/company/{company_id}")
async def company_by_id(company_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_company_by_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return result


# Поиск контактов по id компании
@router.get("/contact")
async def contacts_by_company_id(company_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_contacts_by_company_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contacts not found")
    return result


# Поиск услуги по id
@router.get("/service/{service_id}")
async def service_by_id(service_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result, data = get_service_by_id(service_id)
    if not result:
        if data == "NotFound!":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=data)
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=data)
    return data


# Поиск услуг по id компании (краткая информация)
@router.get("/service")
async def service_by_company_id(company_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_services_by_company_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Services not found")
    return result
