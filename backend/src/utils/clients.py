from src.database.models.client import ClientByPhoneSearchModel, CompanyModel


def get_client_by_phone(phone_num: str) -> list | None:
    try:
        search = ClientByPhoneSearchModel(phone_num)
    except ValueError:
        return None

    return search.get_data()


def get_company_by_id(company_id: int) -> dict | None:
    search = CompanyModel().search_by_id(company_id)
    if search:
        return search.get_info()
    else:
        return None
