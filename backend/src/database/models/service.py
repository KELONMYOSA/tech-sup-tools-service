import ipaddress

from sqlalchemy import func

from src.database.models.aes import NetworkCompany, Service, ServiceDocument, ServiceVlan


class ServiceModel(Service):
    def __init__(self, db):
        self.db = db

    def get_by_id(self, id):
        return self.db.query(ServiceModel).filter(ServiceModel.id == id).first()

    def get_by_ip(self, ip_long):
        return (
            self.db.query(ServiceModel)
            .join(NetworkCompany, ServiceModel.id == NetworkCompany.id_service)
            .filter(
                ip_long >= NetworkCompany.ip, ip_long <= NetworkCompany.ip + func.power(2, 32 - NetworkCompany.mask) - 1
            )
            .all()
        )

    def set_descriptions(self, id, support_desc):
        service = self.db.query(ServiceModel).filter(ServiceModel.id == id, ServiceModel.is_delete == "N").first()
        if service:
            service.support_desc = support_desc
            self.db.commit()

    def update_document_link(self, id, type_id, link):
        service = self.db.query(ServiceModel).filter(ServiceModel.id == id, ServiceModel.is_delete == "N").first()

        if not service or type_id not in [11736, 11737]:
            return

        exists = False
        for doc in service.service_documents:
            if doc.is_delete == "N" and doc.type_id == type_id:
                exists = True
                break

        if exists:
            document = (
                self.db.query(ServiceDocument)
                .filter(
                    ServiceDocument.service_id == id,
                    ServiceDocument.is_delete == "N",
                    ServiceDocument.type_id == type_id,
                )
                .first()
            )
            document.link = link
        else:
            document = ServiceDocument(service_id=id, type_id=type_id, link=link)
            self.db.add(document)
        self.db.commit()
        return document.id

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
        interfaces = []

        for i in self.interfaces:
            if i.id_port is None or i.port.router is None:
                continue

            interfaces.append(
                {
                    "type": i.port_type,
                    "uAddress": i.unit.address if i.unit else None,
                    "eDomain": i.equipment.domain if i.equipment else None,
                    "host": i.port.router.host,
                    "name": i.port.ifname,
                }
            )

        return interfaces

    @property
    def status_string(self):  # noqa: PLR0911
        """Строка состояния для отображения в шаблоне"""
        if self.status_id is None:
            return "???"
        if int(self.status_id) == 727:  # noqa: PLR2004
            if self.changed_status_date is not None:
                return f"Действует с {self.changed_status_date.strftime('%d.%m.%Y %H:%M')} (изм)"
            elif self.connected_date is not None:
                return f"Действует с {self.connected_date.strftime('%d.%m.%Y %H:%M')} (подкл)"
            else:
                return "Действует (с неопределённой даты)"
        elif int(self.status_id) == 829:  # noqa: PLR2004
            if self.disconnect_date is not None:
                return f"Отключена с {self.disconnect_date.strftime('%d.%m.%Y %H:%M')} (откл)"
            elif self.changed_status_date is not None:
                return f"Отключена с {self.changed_status_date.strftime('%d.%m.%Y %H:%M')} (изм)"
            else:
                return "Отключена (с неопределённой даты)"
        elif self.changed_status_date is not None:
            return f"{self.status_descr} c {self.changed_status_date.strftime('%d.%m.%Y %H:%M')} (изм)"
        elif self.create_date is not None:
            return f"{self.status_descr} c {self.create_date.strftime('%d.%m.%Y %H:%M')} (созд)"
        else:
            return f"{self.status_descr} (с неопределённой даты)"

    def get_tech_info(self):
        service_docs = {"files": [], "links": {"wiki": None, "cloud": None}}
        for doc in self.service_documents:
            if doc.is_delete == "N":
                if doc.document and not doc.document.endswith((".vsd", ".vsdx")):
                    service_docs["files"].append(doc.document)
                if doc.link:
                    if doc.type_id == 11736:  # noqa: PLR2004
                        service_docs["links"]["wiki"] = doc.link
                    elif doc.type_id == 11737:  # noqa: PLR2004
                        service_docs["links"]["cloud"] = doc.link
        return {
            "id": int(self.id),
            "typeId": int(self.id_type_service),
            "type": self.type_descr.name,
            "status": self.status_descr,
            "statusString": self.status_string,
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
            "rentServices": [
                {
                    "id": r.id,
                    "type": r.type_descr,
                    "status": r.status_descr,
                    "companyName": r.company.name,
                    "companyId": r.company.id,
                    "isDelete": r.is_delete,
                }
                for r in self.rent_services
            ],
            "rentedFor": [
                {
                    "id": r.id,
                    "type": r.type_descr,
                    "status": r.status_descr,
                    "companyName": r.company.name,
                    "companyId": r.company.id,
                    "isDelete": r.is_delete,
                }
                for r in self.rented_for
            ],
            "pack": [
                {
                    "id": p.id,
                    "type": p.type_descr,
                    "status": p.status_descr,
                }
                for p in self.pack
            ],
            "packServices": [
                {
                    "id": p.id,
                    "type": p.type_descr,
                    "status": p.status_descr,
                    "companyId": p.company.id,
                }
                for p in self.pack_services
            ],
            "companyId": int(self.id_company),
            "company": self.company.name,
            "companyTypeDesc": self.company.client_type_descr,
            "companyBrandName": self.company.brand_name,
            "document": self.document.dog_num if self.document else None,
            "manager": self.company.manager,
            "managerService": self.company.manager_service or None,
            "vlans": self.vlans,
            "addresses": self.__get_addresses(),
            "subnets": self.__get_subnets(),
            "interfaces": self.__get_interfaces(),
            "speed": self.speed,
            "phoneVats": {
                "atsType": self.phone_vats.ats_type.name
                if self.phone_vats and self.phone_vats.ats_type
                else "Не задано",
                "cityLine": self.phone_vats.city_line if self.phone_vats else "Не задано",
                "innerLine": self.phone_vats.inner_line if self.phone_vats else "Не задано",
            },
            "phoneLines": [
                {
                    "targetIn": line.target_in,
                    "targetOut": line.target_out,
                    "phone": line.phone if line.phone == line.phone_end else f"{line.phone} - {line.phone_end}",
                    "typeMobile": line.type_mobile,
                    "typeMgMn": line.type_mg_mn,
                    "typeSpb": line.type_spb,
                    "comm": line.comm or "",
                }
                for line in self.phone_lines
            ],
            "serviceDocs": service_docs,
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
            "company": self.company.name,
            "companyId": int(self.id_company),
        }

    def get_es_data(self):
        return {
            "serviceId": self.id,
            "type": self.type_descr.name,
            "status": self.status_descr.name,
            "desc": self.description,
            "supDesc": self.support_desc,
            "addresses": [
                f"{a.city}"
                f"{', ' + a.street if a.street and a.street.strip() else ''}"
                f"{', ' + a.house if a.house and a.house.strip() else ''}"
                f"{', корп. ' + a.building if a.building and a.building.strip() else ''}"
                f"{', лит. ' + a.letter if a.letter and a.letter.strip() else ''}"
                f"{', кв. ' + a.flat if a.flat and a.flat.strip() else ''}"
                for a in self.addresses
            ],
            "subnet": self.__get_subnets(),
            "cId": self.company.id,
            "cName": self.company.name,
            "brandName": self.company.brand_name,
        }


class ServiceVlanModel(ServiceVlan):
    def __init__(self, db):
        self.db = db

    def set_new_service_vlan(self, service_id, vlan_id):
        vlan = ServiceVlan(vlan=vlan_id, id_service=service_id)
        self.db.add(vlan)
        self.db.commit()

    def delete_service_vlan(self, service_id, vlan_id):
        record = (
            self.db.query(ServiceVlan)
            .filter(
                ServiceVlan.id_service == service_id,
                ServiceVlan.vlan == vlan_id,
            )
            .first()
        )
        if record:
            self.db.delete(record)
            self.db.commit()
            return True
        else:
            return False
