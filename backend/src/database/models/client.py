from sqlalchemy import func, select

from src.database.db import oracle_db
from src.database.models.aes import Client, ClientPhone, Company, CompanyContact
from src.database.models.service import ServiceModel


class CompanyModel(Company):
    def __init__(self, db):
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
    def __init__(self, db):
        self.db = db

    def search_by_phonenum(self, phonenum, max_results=10):
        position_expression = func.instr(ClientPhone.phone, phonenum)
        q_client_by_phone = (
            select(CompanyContact)
            .join(Client, CompanyContact.id_client == Client.id)
            .join(ClientPhone, Client.id == ClientPhone.client_id)
            .where(
                Client.is_delete == "N",
                ClientPhone.is_delete == "N",
                ClientPhone.phone.like(f"%{phonenum}%"),
            )
            .order_by(position_expression, ClientPhone.phone)
            .limit(max_results)
        )

        return self.db.execute(q_client_by_phone)


class ClientByPhoneSearchModel:
    def __init__(self, phonenum, max_results=10):
        self.phonenum = "".join([x for x in phonenum if x.isdigit()])
        self.max_results = max_results

    @staticmethod
    def _get_company_data(company):
        return {"id": int(company.id), "name": company.name}

    def get_data(self):
        result_data = []
        # три места для поиска номера:
        # - телефоны контактов компании
        with oracle_db() as db:
            contacts_by_phone = CompanyContactModel(db).search_by_phonenum(self.phonenum, self.max_results)
            company_ids = []
            for res in contacts_by_phone:
                contact = res[0]
                if contact.company and contact.company.status_id and int(contact.company.status_id) == 291:  # noqa: PLR2004
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
                        "phone": [phone.phone for phone in contact.client.phones if phone.phone.find(self.phonenum) != -1][  # noqa: RUF015
                            0
                        ],
                    }
                    if contact.company.id not in company_ids:
                        result_data.append(result_object)
                        company_ids.append(contact.company.id)

        # - поле company.phone
        with oracle_db() as db:
            companies_by_phone = CompanyModel(db).search_by_phone(self.phonenum)
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
            with oracle_db() as db:
                service = ServiceModel(db).get_by_id(service_id)

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
