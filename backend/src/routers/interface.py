from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.interface import create_new_interface, get_address_choices, get_equip_choices, get_port_choices

router = APIRouter(
    prefix="/interface",
    tags=["Interfaces"],
)


@router.get("/choices/address")
async def address_choices(_: User = Depends(get_current_user)):  # noqa: B008
    return get_address_choices()


@router.get("/choices/equipment")
async def equipment_choices(unit_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    return get_equip_choices(unit_id)


@router.get("/choices/port")
async def port_choices(unit_id: int, equip_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    return get_port_choices(unit_id, equip_id)


class CreateInterfaceData(BaseModel):
    id_service: int
    id_unit: int
    id_equip: int
    id_port: int
    port_type: str


@router.post("/")
async def new_interface(data: CreateInterfaceData, user: User = Depends(get_current_user)):  # noqa: B008
    if user.gidNumber in [10001, 10025]:
        create_new_interface(data.id_service, data.id_unit, data.id_equip, data.id_port, data.port_type)
        return {"detail": "Success"}
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient rights")
