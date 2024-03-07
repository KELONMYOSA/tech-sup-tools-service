from src.database.models.client import CompanyModel
from src.database.models.service import ServiceModel


def get_service_by_id(service_id: int) -> tuple[bool, str] | tuple[bool, dict]:
    srv = ServiceModel().get_by_id(service_id)
    if not srv:
        return False, "NotFound!"
    if srv.fiz_id and int(srv.fiz_id) > 0:
        return False, "Forbidden!"
    if srv.id_type_service and int(srv.id_type_service) not in (297, 303, 4179):
        return False, "Wrong type"
    return True, srv.get_tech_info()


def get_services_by_company_id(company_id: int) -> dict:
    company = CompanyModel().search_by_id(company_id)
    active = []
    disabled = []
    for service in company.services:
        srv = ServiceModel().get_by_id(service.id)
        if srv.is_delete and srv.is_delete == "Y":
            continue
        if srv.status_id and srv.status_id in (727, 1454, 8316, 1228):
            active.append(srv.get_tech_info())
        else:
            disabled.append(srv.get_tech_info())
    return {"active": active, "disabled": disabled}
