import ipaddress
from typing import Literal


class ESData:
    def __init__(self, initial_data):
        self.service_id = initial_data["_source"].get("service_id")
        self.service_type = initial_data["_source"].get("service_type")
        self.service_status = initial_data["_source"].get("service_status")
        self.service_description = initial_data["_source"].get("service_description")
        self.service_support_description = initial_data["_source"].get("service_support_description")
        self.service_phone = initial_data["_source"].get("service_phone")
        self.service_phone_end = initial_data["_source"].get("service_phone_end")
        self.service_address = (
            [initial_data["_source"].get("service_address")] if initial_data["_source"].get("service_address") else []
        )
        if initial_data["_source"].get("service_subnet"):
            ip = int(initial_data["_source"].get("service_subnet").split("/")[0])
            mask = int(initial_data["_source"].get("service_subnet").split("/")[1])
            self.service_subnet = [f"{ipaddress.IPv4Address(ip)!s}/{mask}"]
        else:
            self.service_subnet = []
        self.service_interface_host = (
            [initial_data["_source"].get("service_interface_host")]
            if initial_data["_source"].get("service_interface_host")
            else []
        )
        self.company_id = initial_data["_source"].get("company_id")
        self.company_name = initial_data["_source"].get("company_name")
        self.company_brand_name = initial_data["_source"].get("company_brand_name")
        self.company_phone = initial_data["_source"].get("company_phone")
        self.company_email = initial_data["_source"].get("company_email")
        self.company_address = (
            [initial_data["_source"].get("company_address")] if initial_data["_source"].get("company_address") else []
        )
        self.client_phone = (
            [initial_data["_source"].get("client_phone")] if initial_data["_source"].get("client_phone") else []
        )

    def add_data(self, data):
        if (
            data["_source"].get("service_address")
            and data["_source"].get("service_address") not in self.service_address
        ):
            self.service_address.append(data["_source"].get("service_address"))
        if data["_source"].get("service_subnet"):
            ip = int(data["_source"].get("service_subnet").split("/")[0])
            mask = int(data["_source"].get("service_subnet").split("/")[1])
            ip_styled = f"{ipaddress.IPv4Address(ip)!s}/{mask}"
            if ip_styled not in self.service_subnet:
                self.service_subnet.append(ip_styled)
        if (
            data["_source"].get("service_interface_host")
            and data["_source"].get("service_interface_host") not in self.service_interface_host
        ):
            self.service_interface_host.append(data["_source"].get("service_interface_host"))
        if (
            data["_source"].get("company_address")
            and data["_source"].get("company_address") not in self.company_address
        ):
            self.company_address.append(data["_source"].get("company_address"))
        if data["_source"].get("client_phone") and data["_source"].get("client_phone") not in self.client_phone:
            self.client_phone.append(data["_source"].get("client_phone"))

    def to_dict(
        self, search_text: str, search_type: Literal["c_id", "s_id", "c_name", "address", "ip", "phone", "all"]
    ) -> dict:
        return {
            "search_value": self._find_value_by_search_type(search_text, search_type),
            "service_id": self.service_id,
            "service_type": self.service_type,
            "service_status": self.service_status,
            "service_address": self.service_address,
            "service_description": self.service_description,
            "service_support_description": self.service_support_description,
            "company_id": self.company_id,
            "company_name": self.company_name,
        }

    def _find_value_by_search_type(
        self, search_string: str, search_type: Literal["c_id", "s_id", "c_name", "address", "ip", "phone", "all"]
    ) -> str:
        search_args = {
            "c_id": [self.company_id],
            "s_id": [self.service_id],
            "c_name": [self.company_name],
            "address": [self.service_address, self.company_address],
            "ip": [self.service_subnet, self.service_interface_host],
            "phone": [self.company_phone, self.client_phone, self.service_phone, self.service_phone_end],
            "all": [
                self.company_id,
                self.service_id,
                self.company_name,
                self.service_address,
                self.company_address,
                self.service_subnet,
                self.service_interface_host,
                self.company_phone,
                self.client_phone,
                self.service_phone,
                self.service_phone_end,
            ],
        }

        search_string = search_string.lower()
        score2item = {}
        for field_value in search_args[search_type]:
            if isinstance(field_value, list):
                for item in field_value:
                    if search_string in item.lower():
                        return item
                    else:
                        score = 0
                        for c in search_string:
                            if c in item.lower():
                                score += 1
                        score2item[score] = item
            elif search_string in str(field_value).lower():
                return field_value
            else:
                score = 0
                for c in search_string:
                    if c in str(field_value).lower():
                        score += 1
                score2item[score] = field_value
        return score2item[max(score2item.keys())]


class ESDataManager:
    def __init__(self):
        self.data = []
        self.company_ids = set()
        self.service_ids = set()
        self.service_types = set()
        self.service_statuses = {}
        self.company_id2name = {}

    def create_from_response(self, response):
        data_map = {}
        for item in response:
            source = item["_source"]
            service_id = source["service_id"]
            company_id = source["company_id"]
            service_type = source["service_type"]
            company_name = source["company_name"]
            service_status = source["service_status"]

            self.company_ids.add(company_id)
            self.service_ids.add(service_id)
            self.service_types.add(service_type)

            if service_id in data_map:
                data_map[service_id].add_data(item)
            else:
                data_map[service_id] = ESData(item)
                if service_status in self.service_statuses:
                    self.service_statuses[service_status] += 1
                else:
                    self.service_statuses[service_status] = 1
                if company_id not in self.company_id2name:
                    self.company_id2name[company_id] = company_name
        self.data = list(data_map.values())

    def make_response(
        self, search_text: str, search_type: Literal["c_id", "s_id", "c_name", "address", "ip", "phone", "all"]
    ) -> dict:
        response = {
            "stats": {
                "services_count": len(self.service_ids),
                "companies_count": len(self.company_ids),
                "service_ids": list(self.service_ids),
                "company_ids": list(self.company_ids),
                "service_types": list(self.service_types),
                "service_statuses": self.service_statuses,
                "company_id2name": self.company_id2name,
            },
            "data": [item.to_dict(search_text, search_type) for item in self.data],
        }
        return response