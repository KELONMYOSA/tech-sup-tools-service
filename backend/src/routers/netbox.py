import pynetbox
from fastapi import APIRouter, Depends, HTTPException

from src.config import settings
from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.netbox import (
    CreateNetboxDeviceData,
    CreateNetboxSiteData,
    create_device,
    create_site,
    get_devices_fields_info,
    get_sites_fields_info,
)

router = APIRouter(
    prefix="/netbox",
    tags=["NetBox"],
)

nb = pynetbox.api(settings.NETBOX_URL, token=settings.NETBOX_TOKEN)


@router.get("/devices/choices")
async def devices_fields_info(_: User = Depends(get_current_user)):  # noqa: B008
    return get_devices_fields_info(nb)


@router.post("/devices")
async def create_new_device(data: CreateNetboxDeviceData, _: User = Depends(get_current_user)):  # noqa: B008
    result, msg = create_device(nb, data)
    if not result:
        raise HTTPException(status_code=msg.status_code, detail=msg.text)
    return {"id": msg}


@router.get("/sites/choices")
async def sites_fields_info(_: User = Depends(get_current_user)):  # noqa: B008
    return get_sites_fields_info(nb)


@router.post("/sites")
async def create_new_site(data: CreateNetboxSiteData, _: User = Depends(get_current_user)):  # noqa: B008
    result, msg = create_site(nb, data)
    if not result:
        raise HTTPException(status_code=msg.status_code, detail=msg.text)
    return {"id": msg}
