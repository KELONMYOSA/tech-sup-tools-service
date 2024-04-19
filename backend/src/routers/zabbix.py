from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse

from src.utils.zabbix import create_traffic_link

router = APIRouter(
    prefix="/zabbix",
    tags=["ZABBIX"],
)


@router.get("/traffic")
async def get_traffic_link(host: str, interface: str):
    if link := create_traffic_link(host, interface):
        return RedirectResponse(link, status_code=302)

    if "/" in interface and (link := create_traffic_link(host, interface.split("/")[-1])):
        return RedirectResponse(link, status_code=302)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Graph not found")
