from src.database.db import oracle_db
from src.database.models.company import CompanyModel
from src.database.models.service import ServiceModel


def get_service_by_id(service_id: int) -> tuple[bool, str] | tuple[bool, dict]:
    with oracle_db() as db:
        srv = ServiceModel(db).get_by_id(service_id)
        if not srv:
            return False, "NotFound!"
        if srv.fiz_id and int(srv.fiz_id) > 0:
            return False, "Forbidden!"
        return True, srv.get_tech_info()


def get_services_by_company_id(company_id: int) -> list | None:
    with oracle_db() as db:
        company = CompanyModel(db).search_by_id(company_id)
        if not company:
            return None
        services = []
        for service in company.services:
            srv = ServiceModel(db).get_by_id(service.id)
            if srv.is_delete and srv.is_delete == "Y":
                continue
            services.append(srv.get_brief_info())

        if len(services) == 0:
            return None

        return services
