from src.database.db import oracle_db
from src.database.models.service import ServiceModel


def get_service_by_id(service_id: int) -> tuple[bool, str] | tuple[bool, dict]:
    with oracle_db() as db:
        srv = ServiceModel(db).get_by_id(service_id)
        if not srv:
            return False, "NotFound!"
        if srv.fiz_id and int(srv.fiz_id) > 0:
            return False, "Forbidden!"
        return True, srv.get_tech_info()
