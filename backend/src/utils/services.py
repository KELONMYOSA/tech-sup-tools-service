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
        return True, srv.get_tech_info()


def get_service_by_id_brief(service_id: int) -> dict | None:
    with oracle_db() as db:
        active = []
        disabled = []

        srv = ServiceModel(db).get_by_id(service_id)
        if not srv:
            return None
        if srv.is_delete and srv.is_delete == "Y":
            return None
        if srv.status_id and srv.status_id in (727, 1454, 8316, 1228):
            active.append(srv.get_brief_info())
        else:
            disabled.append(srv.get_brief_info())

        if len(active) + len(disabled) == 0:
            return None

        return {"active": active, "disabled": disabled}


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

        if len(active) + len(disabled) == 0:
            return None

        return {"active": active, "disabled": disabled}
