from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.pg.service import create_wifi_setup_service, get_wifi_setup_service, update_wifi_setup_service
from src.utils.services import (
    delete_service_vlan,
    get_service_by_id,
    get_services_by_company_id,
    set_new_service_vlan,
    set_service_desc_by_id,
    set_service_doc_link_by_id,
)

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


# Поиск всех услуг по id компании
@router.get("/byCompany/{company_id}")
async def services_by_company_id(company_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_services_by_company_id(company_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Services not found")
    return result


# Изменить комментарии к услуге по id
class ChangeDescData(BaseModel):
    support_desc: str


@router.patch("/description/{service_id}")
async def update_service_desc_by_id(service_id: int, desc_data: ChangeDescData, _: User = Depends(get_current_user)):  # noqa: B008
    if len(desc_data.support_desc) > 999:  # noqa: PLR2004
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Description too long")
    set_service_desc_by_id(service_id, desc_data.support_desc)
    return {"detail": "Success"}


# Изменить ссылку документа услуги по id услуги
class ChangeDocLinkData(BaseModel):
    doc_type_id: int
    link: str


@router.patch("/document/link/{service_id}")
async def update_service_doc_link_by_id(
    service_id: int,
    link_data: ChangeDocLinkData,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if len(link_data.link) > 102:  # noqa: PLR2004
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Link too long")
    result = set_service_doc_link_by_id(service_id, link_data.doc_type_id, link_data.link)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Service not found or incorrect document type id"
        )
    return {"detail": "Success", "document_id": result}


# Добавить vlan к услуге
@router.post("/vlan")
async def add_service_vlan(service_id: int, vlan_id: int, user: User = Depends(get_current_user)):  # noqa: B008
    if user.gidNumber in [10001, 10025]:
        set_new_service_vlan(service_id, vlan_id)
        return {"detail": "Success"}
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient rights")


# Удалить vlan у услуги
@router.delete("/vlan")
async def remove_vlan(service_id: int, vlan_id: int, user: User = Depends(get_current_user)):  # noqa: B008
    if user.gidNumber in [10001, 10025]:
        if delete_service_vlan(service_id, vlan_id):
            return {"detail": "Success"}
        else:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Service vlan not found")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient rights")


# Создать запись с данными для услуги 'Организация WiFi сети'
class WifiSetupData(BaseModel):
    service_id: int
    wifi_type: str | None
    controller_domain: str | None
    router_domain: str | None
    equipment_domain: str | None
    ssid: str | None


@router.post("/wifi-setup")
async def create_wifi_setup(data: WifiSetupData, _: User = Depends(get_current_user)):  # noqa: B008
    create_wifi_setup_service(**data.model_dump())
    return {"detail": "Success"}


# Обновить запись с данными для услуги 'Организация WiFi сети'
@router.put("/wifi-setup")
async def update_wifi_setup(data: WifiSetupData, _: User = Depends(get_current_user)):  # noqa: B008
    if update_wifi_setup_service(**data.model_dump()):
        return {"detail": "Success"}
    else:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Wifi Setup Service not found")


# Получить данные услуги 'Организация WiFi сети'
@router.get("/wifi-setup/{service_id}")
async def get_wifi_setup(service_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    result = get_wifi_setup_service(service_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wifi Setup Service not found")
    return result
