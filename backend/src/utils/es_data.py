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
        self.service_subnet = (
            [initial_data["_source"].get("service_subnet")] if initial_data["_source"].get("service_subnet") else []
        )
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
        if data["_source"].get("service_subnet") and data["_source"].get("service_subnet") not in self.service_subnet:
            self.service_subnet.append(data["_source"].get("service_subnet"))
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

    def to_dict(self):
        return {
            "service_id": self.service_id,
            "service_type": self.service_type,
            "service_status": self.service_status,
            "service_address": self.service_address,
            "service_description": self.service_description,
            "service_support_description": self.service_support_description,
            "company_id": self.company_id,
            "company_name": self.company_name,
        }


class ESDataManager:
    def __init__(self):
        self.data = []
        self.company_ids = set()
        self.service_ids = set()
        self.service_statuses = {}

    def create_from_response(self, response):
        data_map = {}
        for item in response:
            source = item["_source"]
            service_id = source["service_id"]
            company_id = source["company_id"]
            service_status = source["service_status"]

            self.company_ids.add(company_id)
            self.service_ids.add(service_id)

            if service_status in self.service_statuses:
                self.service_statuses[service_status] += 1
            else:
                self.service_statuses[service_status] = 1

            if service_id in data_map:
                data_map[service_id].add_data(item)
            else:
                data_map[service_id] = ESData(item)
        self.data = list(data_map.values())

    def make_response(self):
        response = {
            "stats": {
                "services_count": len(self.service_ids),
                "companies_count": len(self.company_ids),
                "service_ids": list(self.service_ids),
                "company_ids": list(self.company_ids),
                "service_statuses": self.service_statuses,
            },
            "data": [item.to_dict() for item in self.data],
        }
        return response
