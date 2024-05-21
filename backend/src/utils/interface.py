import ipaddress

from src.database.db import oracle_db
from src.database.models.interface import InterfaceModel


def get_address_choices():
    with oracle_db() as db:
        inf = InterfaceModel(db)
        addr_rows = inf.get_all_unit_addresses()
        addresses = []
        for row in addr_rows:
            addresses.append(
                {
                    "id": row.Unit.id,
                    "address": ("" if row.AllAddress.city in [None, "", " "] else row.AllAddress.city)
                    + ("" if row.AllAddress.street in [None, "", " "] else f", {row.AllAddress.street}")
                    + ("" if row.AllAddress.house in [None, "", " "] else f", {row.AllAddress.house}")
                    + ("" if row.AllAddress.building in [None, "", " "] else f", {row.AllAddress.building}")
                    + ("" if row.AllAddress.letter in [None, "", " "] else f", {row.AllAddress.letter}")
                    + ("" if row.AllAddress.flat in [None, "", " "] else f", {row.AllAddress.flat}"),
                }
            )
        addresses.sort(key=lambda a: a["address"])
        return addresses


def get_equip_choices(unit_id):
    with oracle_db() as db:
        inf = InterfaceModel(db)
        equip_rows = inf.get_all_equip_by_unit_id(unit_id)
        equip = []
        for row in equip_rows:
            equip.append(
                {
                    "id": row.id_equipment,
                    "domain": row.domain,
                    "ip": f"{ipaddress.IPv4Address(int(row.ip))!s}" if row.ip else None,
                }
            )
        equip.sort(key=lambda e: e["id"])
        return equip


def get_port_choices(ip):
    with oracle_db() as db:
        inf = InterfaceModel(db)
        port_rows = inf.get_all_ports_by_ip(ip)
        ports = []
        for row in port_rows:
            ports.append({"id": row.id, "name": f"{row.ifname}"})
        ports.sort(key=lambda port: port["name"])
        return ports


def create_new_interface(id_service, id_unit, id_equip, id_port, port_type):
    with oracle_db() as db:
        InterfaceModel(db).set_new_interface(id_service, id_unit, id_equip, id_port, port_type)
