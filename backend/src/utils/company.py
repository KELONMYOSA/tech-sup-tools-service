from src.database.db import oracle_db
from src.database.models.company import CompanyModel


def get_company_by_id(company_id: int) -> dict | None:
    with oracle_db() as db:
        search = CompanyModel(db).search_by_id(company_id)
        if search:
            return search.get_info()
        else:
            return None


def get_contacts_by_company_id(company_id: int) -> list[dict] | None:
    with oracle_db() as db:
        search = CompanyModel(db).search_by_id(company_id)
        if search:
            return search.get_contacts()
        else:
            return None
