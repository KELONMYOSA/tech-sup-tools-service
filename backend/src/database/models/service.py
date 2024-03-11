import ipaddress

from src.database.models.aes import Service


class ServiceModel(Service):
    def __init__(self, db):
        self.db = db

    def get_by_id(self, id):
        return self.db.query(ServiceModel).filter(ServiceModel.id == id).first()

    def __get_addresses(self):
        addresses = []
        for a in self.addresses:
            addresses.append(
                {
                    "city": a.city or "",
                    "street": a.street or "",
                    "house": a.house or "",
                    "building": a.building or "",
                    "flat": a.flat or "",
                    "letter": a.letter or "",
                }
            )
        return addresses

    def __get_subnets(self):
        subnets = []
        for s in self.ipnetworks:
            subnets.append(f"{ipaddress.IPv4Address(int(s.ip))!s}/{int(s.mask)}")
        return subnets

    def __get_interfaces(self):
        interfaces = {
            "l2": [],
            "l3": [],
        }

        for i in self.interfaces:
            if i.id_port is None or i.port.router is None:
                continue

            interfaces[i.port_type.lower()].append(
                {
                    "host": i.port.router.host,
                    "name": i.port.ifname,
                    "index": int(i.port.ifindex),
                }
            )

        return interfaces

    def get_tech_info(self):
        return {
            "id": int(self.id),
            "typeId": int(self.id_type_service),
            "type": self.type_descr.name,
            "status": self.status_descr,
            "statusDate": self.changed_status_date.strftime("%Y-%m-%d")
            if self.changed_status_date
            else self.create_date.strftime("%Y-%m-%d"),
            "isProvider": self.provider == "Y",
            "provider": {
                "id": self.company.provider_company.company.id,
                "name": self.company.provider_company.company.name,
            },
            "description": self.description or None,
            "supportDescription": self.support_desc or None,
            "companyId": int(self.id_company),
            "company": self.company.name,
            "companyTypeDesc": self.company.client_type_descr,
            "companyBrandName": self.company.brand_name,
            "document": self.document.dog_num if self.document else None,
            "manager": self.company.manager,
            "managerService": self.company.manager_service or None,
            "contactIds": [contact.id for contact in self.company.contacts if contact.client.is_delete == "N"],
            "vlans": self.vlans,
            "addresses": self.__get_addresses(),
            "subnets": self.__get_subnets(),
            "interfaces": self.__get_interfaces(),
            "speed": self.speed,
        }

    def get_brief_info(self):
        return {
            "id": int(self.id),
            "type": self.type_descr.name,
            "status": self.status_descr,
            "statusDate": self.changed_status_date.strftime("%Y-%m-%d")
            if self.changed_status_date
            else self.create_date.strftime("%Y-%m-%d"),
            "isProvider": self.provider == "Y",
            "description": self.description or None,
            "supportDescription": self.support_desc or None,
            "addresses": self.__get_addresses(),
        }
