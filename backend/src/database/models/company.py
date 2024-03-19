from src.database.models.aes import Company


class CompanyModel(Company):
    def __init__(self, db):
        self.db = db

    def search_by_id(self, company_id: int):
        return self.db.query(CompanyModel).filter(CompanyModel.id == company_id, CompanyModel.is_delete == "N").first()

    def get_info(self):
        return {
            "id": self.id,
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
