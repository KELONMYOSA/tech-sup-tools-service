from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse

from src.utils.zabbix import create_traffic_link

router = APIRouter(
    prefix="/zabbix",
    tags=["ZABBIX"],
)


@router.get("/traffic")
async def get_traffic_link(host: str, interface: str):
    link = create_traffic_link(host, interface)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Graph not found")
    return RedirectResponse(link, status_code=302)
