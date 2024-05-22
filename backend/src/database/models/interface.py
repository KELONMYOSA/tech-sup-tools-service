from src.database.models.aes import AllAddress, EquipmentIntService, Port, Router, Unit, UnitEquipment


class InterfaceModel(EquipmentIntService):
    def __init__(self, db):
        self.db = db

    def get_all_unit_addresses(self):
        return (
            self.db.query(Unit, AllAddress)
            .join(AllAddress, AllAddress.id == Unit.id_address)
            .filter(Unit.is_delete == "N")
            .all()
        )

    def get_all_equip_by_unit_id(self, unit_id):
        return self.db.query(UnitEquipment).filter(UnitEquipment.id_unit == unit_id).all()

    def get_all_ports_by_ip(self, ip):
        ports = self.db.query(Port).join(Router, Router.id == Port.router_id).filter(Router.host == ip).all()
        return ports

    def set_new_interface(self, id_service, id_unit, id_equip, id_port, port_type):
        inf = EquipmentIntService(
            id_service=id_service, unit_id=id_unit, equip_id=id_equip, id_port=id_port, port_type=port_type
        )
        self.db.add(inf)
        self.db.commit()
