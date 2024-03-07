from fastapi import APIRouter, HTTPException, status

from src.utils.clients import get_client_by_phone, get_company_by_id
from src.utils.services import get_service_by_id, get_services_by_company_id

router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


# Поиск клиента по номеру телефона
@router.get("/client")
async def client_by_phone(phone: str):
    result = get_client_by_phone(phone)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong input format")
    return result


# Поиск компании по id
@router.get("/company/{company_id}")
async def company_by_id(company_id: int):
    result = get_company_by_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return result


# Поиск услуги по id
@router.get("/service/{service_id}")
async def service_by_id(service_id: int):
    result, data = get_service_by_id(service_id)
    if not result:
        if data == "NotFound!":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=data)
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=data)
    return data


# Поиск услуг по id компании
@router.get("/service")
async def service_by_company_id(company_id: int):
    result = get_services_by_company_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Services not found")
    return result
