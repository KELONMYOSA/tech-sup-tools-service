from src.database.models.client import ClientByPhoneSearchModel, CompanyModel


def get_client_by_phone(phone_num: str, max_results: int = 10) -> list | None:
    search = ClientByPhoneSearchModel(phone_num, max_results)
    if search:
        return search.get_data()
    else:
        return None


def get_company_by_id(company_id: int) -> dict | None:
    search = CompanyModel().search_by_id(company_id)
    if search:
        return search.get_info()
    else:
        return None


def get_contacts_by_company_id(company_id: int) -> list[dict] | None:
    search = CompanyModel().search_by_id(company_id)
    if search:
        return search.get_contacts()
    else:
        return None
