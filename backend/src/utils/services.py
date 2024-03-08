from src.database.db import oracle_db
from src.database.models.client import CompanyModel
from src.database.models.service import ServiceModel


def get_service_by_id(service_id: int) -> tuple[bool, str] | tuple[bool, dict]:
    with oracle_db() as db:
        srv = ServiceModel(db).get_by_id(service_id)
        if not srv:
            return False, "NotFound!"
        if srv.fiz_id and int(srv.fiz_id) > 0:
            return False, "Forbidden!"
        if srv.id_type_service and int(srv.id_type_service) not in (297, 303, 4179):
            return False, "Wrong type"
        return True, srv.get_tech_info()


def get_services_by_company_id(company_id: int) -> dict | None:
    with oracle_db() as db:
        company = CompanyModel(db).search_by_id(company_id)
        if not company:
            return None
        active = []
        disabled = []
        for service in company.services:
            srv = ServiceModel(db).get_by_id(service.id)
            if srv.is_delete and srv.is_delete == "Y":
                continue
            if srv.status_id and srv.status_id in (727, 1454, 8316, 1228):
                active.append(srv.get_brief_info())
            else:
                disabled.append(srv.get_brief_info())
        return {"active": active, "disabled": disabled}
