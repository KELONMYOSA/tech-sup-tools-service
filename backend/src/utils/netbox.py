from pydantic import BaseModel
from pynetbox import RequestError
from pynetbox.core.api import Api


def get_devices_fields_info(nb: Api) -> dict:
    return {
        "deviceRoles": [{"id": role.id, "name": role.name} for role in nb.dcim.device_roles.all()],
        "deviceTypes": [{"id": t.id, "name": t.display} for t in nb.dcim.device_types.all()],
        "sites": [{"id": site.id, "name": site.name} for site in nb.dcim.sites.all()],
        "statuses": nb.dcim.devices.choices()["status"],
    }


class CreateNetboxDeviceData(BaseModel):
    name: str
    role: int
    device_type: int
    serial: str
    asset_tag: str
    site: int
    status: str


def create_device(nb: Api, data: CreateNetboxDeviceData) -> tuple:
    try:
        id_device = nb.dcim.devices.create(**data.model_dump()).id
        return True, id_device
    except RequestError as e:
        return False, e.req


def get_sites_fields_info(nb: Api) -> dict:
    return {
        "regions": [{"id": region.id, "name": region.name} for region in nb.dcim.regions.all()],
        "statuses": nb.dcim.sites.choices()["status"],
    }


class CreateNetboxSiteData(BaseModel):
    name: str
    slug: str
    status: str
    region: int
    physical_address: str
    comments: str | None = None
    custom_fields: dict | None = None


def create_site(nb: Api, data: CreateNetboxSiteData) -> tuple:
    if data.comments is None:
        data.comments = ""

    try:
        id_site = nb.dcim.sites.create(**data.model_dump()).id
        return True, id_site
    except RequestError as e:
        return False, e.req
