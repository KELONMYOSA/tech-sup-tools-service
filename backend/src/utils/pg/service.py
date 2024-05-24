from src.database.db import postgres_db
from src.database.models.pg.service import Service, WifiSetupService


def create_wifi_setup_service(
    service_id: int, wifi_type: str, controller_domain: str, router_domain: str, equipment_domain, ssid: str
):
    with postgres_db() as db:
        new_service = Service(id=service_id, type_id=11797)
        db.add(new_service)

        new_wifi_service = WifiSetupService(
            id=service_id,
            type=wifi_type,
            controller_domain=controller_domain,
            router_domain=router_domain,
            equipment_domain=equipment_domain,
            ssid=ssid,
        )
        db.add(new_wifi_service)
        db.commit()


def update_wifi_setup_service(
    service_id: int, wifi_type: str, controller_domain: str, router_domain: str, equipment_domain, ssid: str
) -> bool:
    with postgres_db() as db:
        wifi_service = db.query(WifiSetupService).filter(WifiSetupService.id == service_id).first()
        if not wifi_service:
            return False

        wifi_service.type = wifi_type
        wifi_service.controller_domain = controller_domain
        wifi_service.router_domain = router_domain
        wifi_service.equipment_domain = equipment_domain
        wifi_service.ssid = ssid
        db.commit()
        return True


def get_wifi_setup_service(service_id: int) -> dict | None:
    with postgres_db() as db:
        wifi_service = db.query(WifiSetupService).filter(WifiSetupService.id == service_id).first()
        if not wifi_service:
            return None

        return {
            "id": wifi_service.id,
            "type": wifi_service.type,
            "controller_domain": wifi_service.controller_domain,
            "router_domain": wifi_service.router_domain,
            "equipment_domain": wifi_service.equipment_domain,
            "ssid": wifi_service.ssid,
        }
