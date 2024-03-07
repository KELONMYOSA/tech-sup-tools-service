from sqlalchemy import select

from src.database.db import oracle_db
from src.database.models.aes import Client, ClientPhone, Company, CompanyContact
from src.database.models.service import ServiceModel


class CompanyModel(Company):
    def __init__(self):
        with oracle_db() as db:
            self.db = db

    def search_by_phone(self, phonenum):
        q_company_by_phone = select(Company).where(
            Company.is_delete == "N",
            Company.status_id == 291,  # noqa: PLR2004
            Company.phone == phonenum,
        )
        return self.db.execute(q_company_by_phone)

    def search_by_id(self, company_id: int):
        return self.db.query(CompanyModel).filter(CompanyModel.id == company_id, CompanyModel.is_delete == "N").first()

    def get_info(self):
        return {
            "client": f"(ID: {self.id}) {self.name }",
            "brandName": self.brand_name or "",
            "type": self.client_type_descr,
            "status": self.status_descr,
            "provider": self.provider_company.name,
        }

    def get_contacts(self):
        contacts = self.contacts
        result = []
        for contact in contacts:
            if contact.client.is_delete == "N":
                phones = []
                for phone in contact.client.phones:
                    if phone.phone:
                        phones.append({"phone": phone.phone, "ext": phone.ext})

                result.append(
                    {
                        "name": {
                            "fName": contact.client.fname,
                            "lName": contact.client.lname,
                            "mName": contact.client.mname,
                        },
                        "phones": phones if phones else None,
                        "email": contact.client.email,
                        "type": contact.type_descr.name,
                        "position": contact.position,
                        "send_alarm": contact.send_alarm == "Y",
                        "comments": contact.comments,
                    }
                )
        return result


class CompanyContactModel(CompanyContact):
    def __init__(self):
        with oracle_db() as db:
            self.db = db

    def search_by_phonenum(self, phonenum):
        q_client_by_phone = (
            select(CompanyContact)
            .join(Client, CompanyContact.id_client == Client.id)
            .join(ClientPhone, Client.id == ClientPhone.client_id)
            .where(
                Client.is_delete == "N",
                ClientPhone.is_delete == "N",
                ClientPhone.phone == phonenum,
            )
            .distinct()
        )

        return self.db.execute(q_client_by_phone)


class ClientByPhoneSearchModel:
    def __init__(self, phonenum):
        digits_only = "".join([x for x in phonenum if x.isdigit()])

        if len(digits_only) not in (7, 10, 11):
            raise ValueError

        if len(digits_only) == 7:  # noqa: PLR2004
            self.phonenum = "812" + digits_only
        elif len(digits_only) == 11 and digits_only[0] == "7":  # noqa: PLR2004
            self.phonenum = digits_only[1:]
        else:
            self.phonenum = digits_only

    @staticmethod
    def _get_company_data(company):
        return {"id": int(company.id), "name": company.name}

    def get_data(self):
        result_data = []
        # три места для поиска номера:
        # - телефоны контактов компании
        contacts_by_phone = CompanyContactModel().search_by_phonenum(self.phonenum)
        for res in contacts_by_phone:
            contact = res[0]
            if contact.company and int(contact.company.status_id) == 291:  # noqa: PLR2004
                result_object = {
                    "company": self._get_company_data(contact.company),
                    "contact": {
                        "name": "{0}{1}{2}".format(  # noqa: UP030
                            contact.client.lname + " " if contact.client.lname else "",
                            contact.client.fname + " " if contact.client.fname else "",
                            contact.client.mname if contact.client.mname else "",
                        ),
                        "title": contact.position or "",
                    },
                    "source": "contacts",
                }

                result_data.append(result_object)

        # - поле company.phone
        companies_by_phone = CompanyModel().search_by_phone(self.phonenum)
        for res in companies_by_phone:
            company = res[0]
            result_data.append(
                {
                    "company": self._get_company_data(company),
                    "source": "company.phone",
                }
            )

        # - наши продаваемые номера?..
        service_id = ServiceModel.search_by_phonenum(self.phonenum)
        if service_id != -1:
            service = ServiceModel().get_by_id(service_id)

            if service and service.company:
                try:  # noqa: SIM105
                    result_data.append(
                        {
                            "company": self._get_company_data(service.company),
                            "source": f"service id {int(service.id)}",
                        }
                    )
                except:  # noqa: E722
                    pass

        return result_data
