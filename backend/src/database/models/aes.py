from datetime import datetime

from sqlalchemy import Column, ForeignKey, Table, and_, bindparam, outparam
from sqlalchemy.dialects import oracle
from sqlalchemy.orm import backref, column_property, relationship
from sqlalchemy.sql import func, text

from src.database.base import OracleBase
from src.database.db import oracle_db

service_address_table = Table(
    "service_address",
    OracleBase.metadata,
    Column("id_service", oracle.NUMBER(), ForeignKey("SERVICE.id")),
    Column("id_address", oracle.NUMBER(), ForeignKey("ALL_ADDRESS.id")),
)

service_inet_speed_table = Table(
    "service_inet_speed",
    OracleBase.metadata,
    Column("id_service", oracle.NUMBER(), ForeignKey("SERVICE.id")),
    Column("id_speed", oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id")),
)

rent_service_service_table = Table(
    "rent_service_service",
    OracleBase.metadata,
    Column("rent_service_id", oracle.NUMBER(), ForeignKey("SERVICE.id")),
    Column("id_service", oracle.NUMBER(), ForeignKey("SERVICE.id")),
)

service_pack_table = Table(
    "service_pack",
    OracleBase.metadata,
    Column("id_pack", oracle.NUMBER(), ForeignKey("SERVICE.id")),
    Column("id_service", oracle.NUMBER(), ForeignKey("SERVICE.id")),
    Column("is_delete", oracle.VARCHAR2(1)),
)


class Company(OracleBase):
    __tablename__ = "COMPANY"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    name = Column(oracle.VARCHAR2(999))
    date_reg = Column(oracle.DATE())
    manager_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.CLIENT.id"))
    comm = Column(oracle.VARCHAR2(1000))
    payment_id = Column(oracle.NUMBER())
    client_type_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    status_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    # company_info_id = Column(oracle.NUMBER()) #Это допсведения, не особо нужные
    is_delete = Column(oracle.VARCHAR2(1))
    id_market_stage = Column(oracle.NUMBER())
    direct = Column(oracle.NUMBER())
    create_date = Column(oracle.DATE())
    stop_date = Column(oracle.DATE())
    id_provider = Column(oracle.NUMBER(), ForeignKey("UN_COMPANY.id"))
    created_user_id = Column(oracle.NUMBER())
    # login = Column(oracle.VARCHAR2(30))
    # company_pass = Column('pass', oracle.VARCHAR2(30))
    block = Column(oracle.VARCHAR2(1))
    email = Column(oracle.VARCHAR2(150))
    phone = Column(oracle.VARCHAR2(24))
    roadmap = Column(oracle.VARCHAR2(300))
    brand_name = Column(oracle.VARCHAR2(255))
    provider = Column(oracle.VARCHAR2(1))
    new_company_id = Column(oracle.NUMBER())
    email_invoice = Column(oracle.VARCHAR2(100))
    # contractor_id = Column(oracle.NUMBER())
    # contractor = Column(oracle.VARCHAR2(1))
    # contractor_pers_abon = Column(oracle.FLOAT(126))
    # contractor_pers_install = Column(oracle.FLOAT(126))
    my1 = Column(oracle.VARCHAR2(1))
    # debt_buh_comm = Column(oracle.VARCHAR2(399))
    # debt_man_comm = Column(oracle.VARCHAR2(399))
    # debt_buh_date = Column(oracle.DATE())
    # debt_man_date = Column(oracle.DATE())
    fix_perc_sum = Column(oracle.VARCHAR2(1))
    manager_client_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.CLIENT.id"))
    client_status_id = Column(oracle.NUMBER())
    area_id = Column(oracle.NUMBER())
    # vip_manager_id = Column(oracle.NUMBER())
    with_nds = Column(oracle.VARCHAR2(1))
    # email_invoice2 = Column(oracle.VARCHAR2(100))
    # email_invoice3 = Column(oracle.VARCHAR2(100))

    status_descr = relationship("DicItem", foreign_keys=[status_id])
    client_type_descr = relationship("DicItem", foreign_keys=[client_type_id])

    manager = relationship("Client", foreign_keys=[manager_id])
    manager_service = relationship("Client", foreign_keys=[manager_client_id])

    provider_company = relationship("UnCompany", foreign_keys=[id_provider], uselist=False)


class CompanyContact(OracleBase):
    __tablename__ = "COMPANY_CONTACT"

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    id_client = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.CLIENT.id"))
    id_company = Column(oracle.NUMBER(9, 0), ForeignKey("COMPANY.id"))
    id_type_contact = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    # show_contract
    position = Column(oracle.VARCHAR2(200))
    comments = Column(oracle.VARCHAR2(250))
    send_alarm = Column(oracle.VARCHAR2(1))

    company = relationship("Company", foreign_keys=[id_company], backref=backref("contacts"))
    client = relationship("Client", foreign_keys=[id_client], backref=backref("company_contacts"))
    type_descr = relationship("DicItem", foreign_keys=[id_type_contact])


class CompanyDocument(OracleBase):
    __tablename__ = "COMPANY_DOCUMENT"

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    company_id = Column("company_id", oracle.NUMBER(9, 0), ForeignKey("COMPANY.id"))
    document = Column(oracle.VARCHAR2(255))
    description = Column(oracle.VARCHAR2(355))
    created = Column(oracle.DATE())
    modified = Column(oracle.DATE())
    created_user_id = Column(oracle.NUMBER(9, 0))
    modified_user_id = Column(oracle.NUMBER(9, 0))
    writed = Column(oracle.DATE())
    id_type_document = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    id_doc_status = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    id_ftype_uniq = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    stop_date = Column(oracle.DATE())
    accept_date = Column(oracle.DATE())
    approved_user_id = Column(oracle.NUMBER(9, 0))
    approved_date = Column(oracle.DATE())
    contract_id = Column(oracle.NUMBER(9, 0))
    pay_install_date = Column(oracle.DATE())
    # и еще до одури...
    is_delete = Column(oracle.VARCHAR2(1))
    # и еще до одури...
    dog_num = Column(oracle.VARCHAR2(255))
    # и еще до одури...

    company = relationship("Company", foreign_keys=[company_id], backref=backref("documents"))


class CompanyProp(OracleBase):
    __tablename__ = "COMPANY_PROP"

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    id_company = Column(oracle.NUMBER(9, 0), ForeignKey("COMPANY.id"))
    # inn = Column(oracle.VARCHAR2(15))
    # id_bank = Column(oracle.NUMBER(9,0))
    # id_gendir = Column(oracle.NUMBER(9,0))
    # r_s_bank = Column(oracle.VARCHAR2(40))
    company_name = Column(oracle.VARCHAR2(250))
    # okved = Column(oracle.VARCHAR2(40))
    # ogrn = Column(oracle.VARCHAR2(40))
    # okato = Column(oracle.VARCHAR2(40))
    # l_s = Column(oracle.VARCHAR2(40))
    # idpr_n = Column(oracle.VARCHAR2(25))
    # gio_rodpad = Column(oracle.VARCHAR2(255))
    # contract_argument = Column(oracle.VARCHAR2(150))
    # kpp = Column(oracle.VARCHAR2(12))
    # okpo = Column(oracle.VARCHAR2(15))
    # id_form_own = Column(oracle.NUMBER())
    # id_glbuh = Column(oracle.NUMBER())

    company = relationship("Company", foreign_keys=[id_company], backref=backref("prop"))


class CompanyServiceReasonMonth(OracleBase):
    __tablename__ = "COMPANY_SERVICE_REASON_MONTH"
    __table_args__ = {"schema": "USER_1C"}  # noqa: RUF012

    service_id = Column(oracle.NUMBER(), primary_key=True)
    company_id = Column(oracle.NUMBER())
    reason = Column(oracle.VARCHAR2(999))


class Client(OracleBase):
    __tablename__ = "CLIENT"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9), primary_key=True)
    fname = Column(oracle.VARCHAR2(30))
    mname = Column(oracle.VARCHAR2(20))
    lname = Column(oracle.VARCHAR2(35))
    email = Column(oracle.VARCHAR2(100))
    email2 = Column(oracle.VARCHAR2(100))
    is_delete = Column(oracle.VARCHAR2(1))

    phones = relationship("ClientPhone", backref=backref("client"))

    def __str__(self):
        return f"{self.lname} {self.fname}"


class ClientPhone(OracleBase):
    __tablename__ = "CLIENT_PHONE"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    client_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.CLIENT.id"))
    phone = Column(oracle.VARCHAR2(20))
    phone_type_id = Column(oracle.NUMBER(3, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    is_contact = Column(oracle.VARCHAR2(1))
    # delete_date
    is_delete = Column(oracle.VARCHAR2(1))
    ext = Column(oracle.VARCHAR2(20))
    belong = Column(oracle.VARCHAR2(2))
    # from_afina
    no_contact = Column(oracle.VARCHAR2(2))
    # lu_date
    no_call = Column(oracle.VARCHAR2(2))

    type_descr = relationship("DicItem", foreign_keys=[phone_type_id])


class HistorySession(OracleBase):
    __tablename__ = "HISTORY_SESSION"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    ddate = Column(oracle.DATE())
    user_id = Column(oracle.NUMBER())
    what = Column(oracle.VARCHAR2(155), nullable=False)
    table_name = Column(oracle.VARCHAR2(155), nullable=False)
    valueold = Column(oracle.VARCHAR2(1999))
    valuenew = Column(oracle.VARCHAR2(1999))
    user_name = Column(oracle.VARCHAR2(155))
    id_table = Column(oracle.NUMBER())


class Service(OracleBase):
    __tablename__ = "SERVICE"

    id = Column("id", oracle.NUMBER(8), primary_key=True)
    id_type_service = Column(oracle.NUMBER(8), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    id_company = Column(oracle.NUMBER(), ForeignKey("COMPANY.id"))
    # num = Column(oracle.NUMBER())
    price_once = Column(oracle.FLOAT(126))
    price_period = Column(oracle.FLOAT())
    id_period = Column(oracle.NUMBER(), default=371, server_default=text("371"))
    description = Column(oracle.VARCHAR2(999))
    create_date = Column(oracle.DATE(), default=datetime.now, server_default=func.SYSDATE())
    is_delete = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    fill_date = Column(oracle.DATE())
    priceone_nds = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    priceperiod_nds = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    doc_id = Column(oracle.NUMBER(), ForeignKey("COMPANY_DOCUMENT.id"))
    status_id = Column(oracle.NUMBER(8), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    support_desc = Column(oracle.VARCHAR2(999))
    support_ok = Column(oracle.NUMBER(), default=0, server_default=text("0"))
    created_user_id = Column(oracle.NUMBER())
    connected_date = Column(oracle.DATE())
    new_service_id = Column(oracle.NUMBER())
    rent_id = Column(oracle.NUMBER())
    disconnect_date = Column(oracle.DATE())
    # id_cost_project = Column(oracle.NUMBER())
    read_only = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    # act_work_id = Column(oracle.NUMBER())
    # act_equip_id = Column(oracle.NUMBER())
    provider_date_start = Column(oracle.DATE())
    provider_date_stop = Column(oracle.DATE())
    phone_tarif_id = Column(oracle.NUMBER())
    rent_service_id = Column(oracle.NUMBER())
    prepaid_phone = Column(oracle.FLOAT(126))
    provider = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    count_snmp = Column(oracle.VARCHAR2(1), default="Y", server_default="Y")
    direct = Column(oracle.NUMBER())
    mgmn_doc_id = Column(oracle.NUMBER())
    fiz_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.FIZ.id"))
    fiz_inet_tarif_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.TARIF.id"))
    synced = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    synced_date = Column(oracle.DATE())
    blocked = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    # snmp_port
    blocked_local = Column(oracle.DATE())
    changed_status_date = Column(oracle.DATE())
    changed_status_id_old = Column(oracle.NUMBER())
    last_status_above_zero = Column(oracle.NUMBER())
    mgmn_discount = Column(oracle.NUMBER(), default=0, server_default=text("0"))
    mgmn_minutes_incl = Column(oracle.NUMBER())
    contractor_equip_id = Column(oracle.NUMBER())
    postpaid = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    phone_count_type = Column(oracle.VARCHAR2(2), default="AG", server_default="AG")
    perc_abon = Column(oracle.FLOAT())
    perc_install = Column(oracle.FLOAT())
    fix_perc_sum = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    contractor = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    contractor_id = Column(oracle.NUMBER(), ForeignKey("COMPANY.id"))
    price_period_with_nds = Column(oracle.NUMBER())
    price_once_with_nds = Column(oracle.NUMBER())
    fix_perc_sum_inst = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    fix_perc_sum_ab = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    id_sub_type_service = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    bill_with_address = Column(oracle.VARCHAR2(1), default="Y", server_default="Y")
    type_phone_billing = Column(oracle.VARCHAR2(10), default="AON", server_default="AON")
    ip_traf = Column(oracle.VARCHAR2(1), default="Y", server_default="Y")
    type_of_bill = Column(oracle.NUMBER())
    bill_comment = Column(oracle.VARCHAR2(999))

    status_descr = relationship("DicItem", foreign_keys=[status_id], uselist=False)
    type_descr = relationship("DicItem", foreign_keys=[id_type_service], uselist=False)
    # subtype = relationship("DicItem", foreign_keys=[id_sub_type_service], uselist=False)

    tariff = relationship("Tarif", foreign_keys=[fiz_inet_tarif_id])

    company = relationship(
        "Company", foreign_keys=[id_company], uselist=False, backref=backref("services", order_by=id)
    )

    addresses = relationship("AllAddress", secondary=service_address_table)

    speed_inet = relationship("DicItem", secondary=service_inet_speed_table, uselist=False)

    def __str__(self):
        return f"Service {int(self.id)} ({int(self.id_type_service)}, {int(self.status_id)})"

    # speed = relationship("DicItem", secondary=serviceInetSpeedTable, uselist=False)

    @property
    def speed(self):
        _speed = 0
        if self.fiz_id != 0 and self.fiz_inet_tarif_id:
            return self.tariff.speed_descr.name if self.tariff.id_speed else 0
        if int(self.id_type_service) == 297:  # noqa: PLR2004
            _speed = self.speed_inet.name if self.speed_inet else 0
        elif int(self.id_type_service) == 303:  # noqa: PLR2004
            _speed = "; ".join([str(y) for y in set([str(x.speed) for x in self.vpns])])  # noqa: C403
        elif int(self.id_type_service) == 4179:  # noqa: PLR2004
            _speed = self.iptransit.speed.name if (self.iptransit and self.iptransit.speed) else 0
        elif int(self.id_type_service) == 4180:  # noqa: PLR2004
            _speed = self.peering.speed.name if self.peering and self.peering.id_speed else 0
        elif int(self.id_type_service) == 4534:  # noqa: PLR2004
            _speed = self.speed_inet.name if self.speed_inet else 0

        return _speed

    rent_services = relationship(
        "Service",
        secondary=rent_service_service_table,
        primaryjoin=id == rent_service_service_table.c.id_service,
        secondaryjoin=id == rent_service_service_table.c.rent_service_id,
        viewonly=True,
    )

    rented_for = relationship(
        "Service",
        secondary=rent_service_service_table,
        primaryjoin=id == rent_service_service_table.c.rent_service_id,
        secondaryjoin=id == rent_service_service_table.c.id_service,
        viewonly=True,
    )

    pack = relationship(
        "Service",
        secondary=service_pack_table,
        primaryjoin=id == service_pack_table.c.id_service,
        secondaryjoin=id == service_pack_table.c.id_pack,
        viewonly=True,
    )

    pack_services = relationship(
        "Service",
        secondary=service_pack_table,
        primaryjoin=and_(id == service_pack_table.c.id_pack, service_pack_table.c.is_delete == "N"),
        secondaryjoin=id == service_pack_table.c.id_service,
        viewonly=True,
    )

    vlans = relationship("ServiceVlan")

    interfaces = relationship("EquipmentIntService")

    ipnetworks = relationship("NetworkCompany")

    vpns = relationship("ServiceVpnOffice")

    phone_lines = relationship("ServicePhoneLine")
    # phone_numbers = relationship('ServicePhoneNum')
    # phone_trunks = relationship('ServicePhoneLineTrank')
    phone_vats = relationship("ServicePhoneVats", primaryjoin="Service.id==ServicePhoneVats.id_service", uselist=False)

    # local_connect_trunks = relationship('ServiceLocalConnectTrank')

    rent_fiber = relationship("ServiceRentFiber")

    peering = relationship("ServicePeering", uselist=False)

    iptransit = relationship("ServiceIpTransit", uselist=False)

    # fiz = relationship('Fiz', foreign_keys=[fiz_id], uselist=False)

    document = relationship("CompanyDocument", foreign_keys=[doc_id], uselist=False)

    abonements = relationship("FizAbonsActivated")

    def get_active_abonement(self):
        # return next((x for x in self.abonements if x.))
        pass

    def add_interface(self, snmp_port_id, port_type="L3"):
        proc = text(
            "BEGIN IFS_UN.PCK_SERVICE.prc_interface_add(:I_SERVICE_ID, :I_SNMP_PORT_ID, :I_INTERFACE_TYPE, :O_EIS_ID, "
            ":O_RES_CODE, :O_RES_STR); END;"
        )
        proc = proc.bindparams(
            bindparam("I_SERVICE_ID", int(self.id), oracle.NUMBER),
            bindparam("I_SNMP_PORT_ID", int(snmp_port_id), oracle.NUMBER),
            bindparam("I_INTERFACE_TYPE", str(port_type), oracle.VARCHAR2),
            outparam("O_EIS_ID", oracle.NUMBER),
            outparam("O_RES_CODE", oracle.NUMBER),
            outparam("O_RES_STR", oracle.VARCHAR2),
        )

        with oracle_db as db:
            result = db.execute(proc)

        if int(result.out_parameters["O_RES_CODE"]) != 0:
            return None, result.out_parameters

        return result.out_parameters["O_EIS_ID"], result.out_parameters

    @classmethod
    def search_by_phonenum(cls, phonenum):
        try:
            with oracle_db as db:
                res = db.execute(
                    "SELECT PCK_PHONE.RETURN_SERVICE(:phonenum) FROM DUAL", {"phonenum": phonenum}
                ).scalar()
        except Exception:
            return None
        return res


class ServiceDocument(OracleBase):
    __tablename__ = "SERVICE_DOCUMENT"

    id = Column("id", oracle.NUMBER(), primary_key=True)  # "ID" NUMBER,
    service_id = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))  # "SERVICE_ID" NUMBER NOT NULL ENABLE,
    document = Column(oracle.VARCHAR2(250))  # "DOCUMENT" VARCHAR2(250),
    description = Column(oracle.VARCHAR2(250))  # "DESCRIPTION" VARCHAR2(255),
    created_date = Column(oracle.DATE(), server_default=func.now())  # "CREATED_DATE" DATE DEFAULT sysdate,
    created_user = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.CLIENT.id"))  # "CREATED_USER" NUMBER,
    is_delete = Column(oracle.VARCHAR2(1), server_default=text("N"))  # "IS_DELETE" VARCHAR2(1) DEFAULT 'N',
    delete_date = Column(oracle.DATE())  # "DELETE_DATE" DATE,
    delete_user = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.CLIENT.id"))  # "DELETE_USER" NUMBER,
    link = Column(oracle.VARCHAR2(102))
    type_id = Column(oracle.NUMBER(9))

    service = relationship("Service", foreign_keys=[service_id], backref=backref("service_documents"))


class ServiceLocalConnectLine(OracleBase):
    __tablename__ = "SERVICE_LOCAL_CONNECT_LINE"

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)  # "ID" NUMBER(9,0),
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))  # "ID_SERVICE" NUMBER(9,0),
    # "DATE_ADD" DATE DEFAULT SYSDATE,
    # "ID_PHONE_NUM" NUMBER,
    # "TRANK_NAME" VARCHAR2(50),
    # "ID_EQUIP_L2" NUMBER,
    # "ID_EQUIP_L3" NUMBER,
    # "ID_PORT_L2" NUMBER,
    # "ID_PORT_L3" NUMBER,
    # "ID_UNIT" NUMBER,
    # "ID_UNIT2" NUMBER,
    # "LOGIN" VARCHAR2(50),
    # "PASSWORD" VARCHAR2(50),
    # "IP_SOFTSWITCH" NUMBER,
    # "COUNT_SL" NUMBER,
    # "COMM" VARCHAR2(500),
    # trunk = Column('conn_type', oracle.VARCHAR2(10)) # "CONN_TYPE" VARCHAR2(10),


class ServiceLocalConnectTrank(OracleBase):
    __tablename__ = "SERVICE_LOCAL_CONNECT_TRANK"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    trunk = Column("trank", oracle.VARCHAR2(100))


class ServicePeering(OracleBase):
    __tablename__ = "SERVICE_PEERING"

    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"), primary_key=True)  # ID_SERVICE NUMBER,
    id_speed = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))  # ID_SPEED NUMBER,
    # #vlan = Column(oracle.NUMBER()) #VLAN_ID NUMBER,
    # limited_peering = Column(oracle.VARCHAR2(1), server_default=text('N')) #LIMITED_PEERING VARCHAR2(1) DEFAULT 'N',
    # #ID_PORT_L2 NUMBER,
    # #EQUIP_ID_L2 NUMBER,
    unit1_id = Column(oracle.NUMBER(), ForeignKey("UNIT.id"))  # UNIT1_ID NUMBER,
    bgp_as = Column(oracle.VARCHAR2(255))  # BGP_AS VARCHAR2(255),
    bgp_asset = Column(oracle.VARCHAR2(255))  # BGP_ASSET VARCHAR2(255),

    speed = relationship("DicItem", uselist=False)


class ServicePhoneLine(OracleBase):
    __tablename__ = "SERVICE_PHONE_LINE"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    # line_id = Column(oracle.VARCHAR2(54))
    price_period = Column(oracle.FLOAT(126))
    target_in = Column(oracle.VARCHAR2(1))
    target_out = Column(oracle.VARCHAR2(1))
    type_mobile = Column(oracle.VARCHAR2(1))
    type_mg_mn = Column("type_mn_mg", oracle.VARCHAR2(1))
    type_spb = Column(oracle.VARCHAR2(1))
    # id_price_period = Column(oracle.NUMBER())
    is_delete = Column(oracle.VARCHAR2(1), server_default=text("N"))
    comm = Column(oracle.VARCHAR2(256))
    id_nom = Column(oracle.NUMBER())
    # id_vlan = Column(oracle.NUMBER())
    login = Column(oracle.VARCHAR2(48))
    password = Column(oracle.VARCHAR2(48))
    # id_port_l2 = Column(oracle.NUMBER())
    # id_port_l3 = Column(oracle.NUMBER())
    # id_equip_l2 = Column(oracle.NUMBER())
    # id_equip_l3 = Column(oracle.NUMBER())
    id_rent = Column(oracle.NUMBER())
    id_unit = Column(oracle.NUMBER())
    id_unit2 = Column(oracle.NUMBER())
    phone = Column(oracle.VARCHAR2(24))
    phone_end = Column(oracle.VARCHAR2(24))
    phone_redirect = Column(oracle.VARCHAR2(24))
    # gateway = Column(oracle.NUMBER())
    # n_port = Column(oracle.NUMBER())
    # n_so = Column(oracle.NUMBER())
    # cid = Column(oracle.NUMBER())
    count_sl = Column(oracle.NUMBER())
    trunk_name = Column("trank_name", oracle.VARCHAR2(100))
    ip_phones = Column(oracle.NUMBER())
    ip_device = Column(oracle.NUMBER())
    ip_softswitch = Column(oracle.NUMBER())
    id_network_company = Column(oracle.NUMBER())
    type_ivr = Column(oracle.VARCHAR2(1))

    service = relationship("Service", foreign_keys=[id_service], uselist=False, viewonly=True)


class ServicePhoneNum(OracleBase):
    __tablename__ = "SERVICE_PHONE_NUM"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    phone = Column(oracle.VARCHAR2(24))
    # price = Column(oracle.VARCHAR2(24))
    # id_e1 = Column(oracle.NUMBER())
    dbeg = Column(oracle.VARCHAR2(24))
    dend = Column(oracle.VARCHAR2(24))
    date_add = Column(oracle.DATE())
    # e1_target_in = Column(oracle.VARCHAR2(1), server_default=text('N'))
    # e1_target_out = Column(oracle.VARCHAR2(1), server_default=text('N'))
    # e1_type_mobile = Column(oracle.VARCHAR2(1), server_default=text('N'))
    # e1_type_mg_mn = Column(oracle.VARCHAR2(1), server_default=text('N'))
    # e1_type_spb = Column(oracle.VARCHAR2(1), server_default=text('N'))
    # e1_comm = Column(oracle.VARCHAR2(255))
    # service_lc_dir_id = Column(oracle.NUMBER())


class ServicePhoneLineTrank(OracleBase):
    __tablename__ = "SERVICE_PHONE_LINE_TRANK"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    trunk = Column("trank", oracle.VARCHAR2(100))
    created_date = Column(oracle.DATE())


class ServicePhoneVats(OracleBase):
    __tablename__ = "SERVICE_PHONE_VATS"

    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"), primary_key=True)
    city_line = Column(oracle.NUMBER())
    inner_line = Column(oracle.NUMBER())
    access_lk = Column(oracle.VARCHAR2(1), server_default=text("N"))
    access_adm_ast = Column(oracle.VARCHAR2(1), server_default=text("N"))
    id_type_ats = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    type_tarif = Column(oracle.VARCHAR2(10), server_default=text("aon"))

    ats_type = relationship("DicItem", foreign_keys=[id_type_ats], uselist=False)


class ServiceRentFiber(OracleBase):
    __tablename__ = "SERVICE_RENT_FIBER"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    id_address1 = Column(oracle.NUMBER(), ForeignKey("ALL_ADDRESS.id"))
    id_address2 = Column(oracle.NUMBER(), ForeignKey("ALL_ADDRESS.id"))
    length = Column(oracle.FLOAT(126))
    # price_once
    # price_period
    description = Column(oracle.VARCHAR2(150))
    vein = Column(oracle.NUMBER())
    id_type_connector = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    cross = Column(oracle.NUMBER(9, 0))
    n_port_cross = Column(oracle.VARCHAR2(10))

    address1 = relationship("AllAddress", foreign_keys=[id_address1], uselist=False)
    address2 = relationship("AllAddress", foreign_keys=[id_address2], uselist=False)
    connector_type = relationship("DicItem", foreign_keys=[id_type_connector], uselist=False)


class ServiceVpnOffice(OracleBase):
    __tablename__ = "SERVICE_VPN_OFFICE"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    id_address = Column(oracle.NUMBER(), ForeignKey("ALL_ADDRESS.id"))
    # price = Column(oracle.VARCHAR2(10))
    id_speed = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    # equip_id_l2 = Column(oracle.NUMBER())
    # id_port_l2 = Column(oracle.NUMBER())
    # rent_id
    # unit_id_l2
    # equip_id_l3
    # id_port_l3 = Column(oracle.NUMBER())
    # uniit_id_l3 = Column(oracle.NUMBER())

    address = relationship("AllAddress", uselist=False)
    speed = relationship("DicItem")


class ServiceIpTransit(OracleBase):
    __tablename__ = "SERVICE_IPTRANSIT"

    id_service = Column(oracle.NUMBER(22), ForeignKey("SERVICE.id"), primary_key=True)
    id_speed = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    # count_gb = Column(oracle.NUMBER())
    # count_ip = Column(oracle.NUMBER())
    # vlan_id = Column(oracle.NUMBER())
    # price_over_gb = Column(oracle.FLOAT(126))
    # "ID_PORT_L2" NUMBER,
    # "ID_PORT_L3" NUMBER,
    # "EQUIP_ID_L2" NUMBER,
    # "EQUIP_ID_L3" NUMBER,
    # "ID_OVER_TYPE" NUMBER DEFAULT 725,
    # "ID_TYPE_ANONS" NUMBER,
    # "UNIT1_ID" NUMBER,
    # "UNIT2_ID" NUMBER,
    # "BGP_AS" VARCHAR2(255),
    # "BGP_ASSET" VARCHAR2(255),
    # "SESSION_DIRECT" VARCHAR2(1) DEFAULT 'N',
    # "SESSION_UPLINK_ID" NUMBER,
    # "SESSION_ROUTER_IP" VARCHAR2(100),

    speed = relationship("DicItem", foreign_keys=[id_speed], uselist=False)

    nets = relationship(
        "ServiceIpTransitNet",
        secondary="join(NetworkCompany, ServiceIpTransitNet, "
        "NetworkCompany.id==ServiceIpTransitNet.id_network_company)",
        primaryjoin="and_(ServiceIpTransit.id_service == NetworkCompany.id_service)",
        secondaryjoin="NetworkCompany.id == ServiceIpTransitNet.id_network_company",
    )


# class Service_iptransit_net(db.Model):
# __tablename__ = 'SERVICE_IPTRANSIT_NET'

# id = Column('id', oracle.NUMBER(22), primary_key=True)
# id_network_company = Column(oracle.NUMBER(22), ForeignKey('NETWORK_COMPANY.id'))
# vlan_id = Column(oracle.NUMBER())
# id_overtype = Column(oracle.NUMBER())
# id_type_anons = Column(oracle.NUMBER())
# bgp_as = Column(oracle.VARCHAR2())
# bgp_asset = Column(oracle.VARCHAR2())
# session_direct = Column(oracle.VARCHAR2(1))
# session_uplink_id = Column(oracle.NUMBER())
# session_router_ip = Column(oracle.VARCHAR2(100))


class ServiceIpTransitNet(OracleBase):
    __tablename__ = "SERVICE_IPTRANSIT_NET"

    id = Column("id", oracle.NUMBER(22), primary_key=True)
    id_network_company = Column(oracle.NUMBER(22), ForeignKey("NETWORK_COMPANY.id"))
    vlan_id = Column(oracle.NUMBER())
    id_overtype = Column(oracle.NUMBER())
    id_type_anons = Column(oracle.NUMBER())
    bgp_as = Column(oracle.VARCHAR2())
    bgp_asset = Column(oracle.VARCHAR2())
    session_direct = Column(oracle.VARCHAR2(1))
    session_uplink_id = Column(oracle.NUMBER())
    session_router_ip = Column(oracle.VARCHAR2(100))


class ServiceAddress(OracleBase):
    __tablename__ = "SERVICE_ADDRESS"

    id = Column("id", oracle.NUMBER(8), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    id_address = Column(oracle.NUMBER(), ForeignKey("ALL_ADDRESSES.id"))


class ServiceAddress_(OracleBase):
    __tablename__ = "SERVICE_ADDRESS_"

    adr = Column(oracle.VARCHAR2(462), primary_key=True)
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICES.id"), primary_key=True)


class ServiceVlan(OracleBase):
    __tablename__ = "SERVICE_VLAN"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    vlan = Column(oracle.NUMBER())
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    ddate = Column(oracle.DATE())

    service = relationship("Service", foreign_keys=[id_service])


class Router(OracleBase):
    __tablename__ = "ROUTERS"
    __table_args__ = {"schema": "SNMP"}  # noqa: RUF012
    # __bind__key = 'aes-snmp'

    id = Column("id", oracle.NUMBER(22), primary_key=True)
    host = Column(oracle.VARCHAR2(255))


class Port(OracleBase):
    __tablename__ = "ROUTER_PORT"
    __table_args__ = {"schema": "SNMP"}  # noqa: RUF012
    # __bind__key = 'aes-snmp'

    id = Column("id", oracle.NUMBER(22), primary_key=True)
    router_id = Column(oracle.NUMBER(22), ForeignKey("SNMP.ROUTERS.id"))
    ifindex = Column(oracle.NUMBER(22))
    iftype_id = Column(oracle.NUMBER(22))
    porttype = Column(oracle.VARCHAR2(255))
    ifphysaddress = Column(oracle.VARCHAR2(30))
    ifname = Column(oracle.VARCHAR2(255))
    ifalias = Column(oracle.VARCHAR2(255))
    ifdescr = Column(oracle.VARCHAR2(255))
    ifadminstatus = Column(oracle.VARCHAR2(15))
    ifoperstatus = Column(oracle.VARCHAR2(15))
    ifspeed = Column(oracle.VARCHAR2(20))
    iflastchangedate = Column(oracle.DATE())
    created_date = Column(oracle.DATE())

    router = relationship("Router", backref=backref("ports", order_by=ifindex))


class Network(OracleBase):
    __tablename__ = "NETWORK"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    value = Column(oracle.NUMBER(10))
    comm = Column(oracle.VARCHAR2(255))
    is_delete = Column(oracle.VARCHAR2(1))
    mask = Column(oracle.NUMBER(10))
    homenet = Column(oracle.VARCHAR2(1))
    pool_dynamic = Column(oracle.VARCHAR2(1))
    is_grey = Column(oracle.VARCHAR2(1))


class NetworkCompany(OracleBase):
    __tablename__ = "NETWORK_COMPANY"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    ip = Column(oracle.NUMBER(10, 0))
    mask = Column(oracle.NUMBER(2, 0))
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    id_network = Column(oracle.NUMBER(), ForeignKey("NETWORK.id"))
    is_delete = Column(oracle.VARCHAR2(), default="N", server_default=text("N"))
    id_colocation = Column(oracle.NUMBER())
    id_port_l3 = Column(oracle.NUMBER())
    create_date = Column(oracle.DATE(), default=datetime.today, server_default=func.sysdate())
    delete_date = Column(oracle.DATE())
    mac = Column(oracle.VARCHAR2(32))
    is_static = Column(oracle.VARCHAR2(1), default="N", server_default=text("N"))
    id_service_sec_bgp = Column(oracle.NUMBER())

    service = relationship("Service", backref=backref("ip", order_by=ip))

    network = relationship("Network", foreign_keys=[id_network], uselist=False)

    iptransit = relationship("ServiceIpTransitNet", uselist=False)


class EquipmentIntService(OracleBase):
    __tablename__ = "EQUIPMENT_INT_SERVICE"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_port = Column(oracle.NUMBER(), ForeignKey("SNMP.ROUTER_PORT.id"))
    id_service = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    date_add = Column(oracle.DATE(), default=datetime.today)
    port_type = Column(oracle.VARCHAR2(2))
    unit_id = Column(oracle.NUMBER(), ForeignKey("UNIT.id"))
    equip_id = Column(oracle.NUMBER(), ForeignKey("UNIT_EQUIPMENT.id_equipment"))
    # service_colocation_unit_id = Column(oracle.NUMBER())
    vlan_id = Column(oracle.NUMBER(), nullable=True)
    port_comment = Column(oracle.VARCHAR2(500), nullable=True)

    port = relationship("Port")
    service = relationship("Service", viewonly=True)

    unit = relationship("Unit", viewonly=True)
    equipment = relationship("UnitEquipment", viewonly=True)


class Unit(OracleBase):
    __tablename__ = "UNIT"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_address = Column(oracle.NUMBER(), ForeignKey("ALL_ADDRESS.id"))
    comm = Column(oracle.VARCHAR2(255))
    create_date = Column(oracle.DATE())
    is_delete = Column(oracle.VARCHAR2(1))
    # is_ownership = Column(oracle.VARCHAR2(1))
    # ups = Column(oracle.VARCHAR2(100))
    name = Column(oracle.VARCHAR2(255))
    parent_unit_id = Column(oracle.NUMBER())
    # condit = Column(oracle.VARCHAR2(1))
    # id_type = Column(oracle.NUMBER())
    # parent_equip_id = Column(oracle.NUMBER())
    # parent_port_id = Column(oracle.NUMBER())
    # is_homenet = Column(oracle.VARCHAR2(1))
    # homenet_code = Column(oracle.VARCHAR2(12))
    # lat = Column(oracle.VARCHAR2(120))
    # lon = Column(oracle.VARCHAR2(120))
    id_status = Column(oracle.NUMBER())
    # document = Column(oracle.VARCHAR2(255))
    # id_rig = Column(oracle.NUMBER())

    address = relationship("AllAddress", uselist=False)
    contacts = relationship("UnitContact")


class UnitEquipment(OracleBase):
    __tablename__ = "UNIT_EQUIPMENT"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    id_unit = Column(oracle.NUMBER(), ForeignKey("UNIT.id"))
    id_equipment = Column(oracle.NUMBER())
    ip = Column(oracle.NUMBER())
    snmp_check = Column(oracle.VARCHAR2(1))
    is_delete = Column(oracle.VARCHAR2(1))
    # community = Column(oracle.VARCHAR2(99))
    # bit64 = Column(oracle.NUMBER())
    # ping_status = Column(oracle.NUMBER())
    # ping_response = Column(oracle.VARCHAR2(255))
    # ping_date = Column(oracle.DATE())
    # created_date = Column(oracle.DATE())
    # V3_ skip
    # snmp_ver = Column(oracle.VARCHAR2(2))
    domain = Column(oracle.VARCHAR2(99))
    comm = Column(oracle.VARCHAR2(255))
    netmask = Column(oracle.NUMBER())
    # core = Column(oracle.VARCHAR2(1))
    # alarm_ping = Column(oracle.VARCHAR2(1))

    unit = relationship("Unit", backref=backref("equipment"))


class Fiz(OracleBase):
    __tablename__ = "FIZ"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    fname = Column(oracle.VARCHAR2(30))
    mname = Column(oracle.VARCHAR2(20))
    lname = Column(oracle.VARCHAR2(35))
    # BIRTH_DATE DATE,
    # SEX VARCHAR2(1) DEFAULT 'M',
    # IDENTITY_CARD_TYPE_ID NUMBER(3,0) DEFAULT 1,
    # IDENTITY_CARD_SERIES VARCHAR2(20),
    # IDENTITY_CARD_NUM VARCHAR2(20),
    # IDENTITY_CARD_ISSUER VARCHAR2(128),
    # IDENTITY_CARD_DATEISSUED DATE,
    # IDENTITY_CARD_INFO VARCHAR2(256),
    # EMAIL VARCHAR2(100),
    # EMAIL2 VARCHAR2(100),
    comments = Column(oracle.VARCHAR2(256))
    # BIRTH_COUNTRY VARCHAR2(30),
    # BIRTH_PLACE VARCHAR2(128),
    # CREATE_DATE DATE DEFAULT SYSDATE               ,
    # CREATE_USER_ID NUMBER(9,0),
    changed_user_date = Column(oracle.DATE)
    # CHANGED_USER_ID NUMBER(9,0),
    # DELETE_DATE DATE,
    is_delete = Column(oracle.VARCHAR2(1), default="N", server_default="N")
    # NATIONALITY VARCHAR2(100),
    # FOTOFILE VARCHAR2(255),
    login = Column(oracle.VARCHAR2(32))
    # PASS VARCHAR2(32),
    balance_inet = Column(oracle.FLOAT(126), default=0, server_default=text("0"))
    balance_phone = Column(oracle.FLOAT(126), default=0, server_default=text("0"))
    balance_other = Column(oracle.FLOAT(126), default=0, server_default=text("0"))
    status_id = Column(oracle.NUMBER(22, 0), default=2208)  # STATUS_ID NUMBER(22,0) DEFAULT 2208
    # FIZ_STATUS_MANUAL VARCHAR2(1) DEFAULT 'N',
    # CITIZEN VARCHAR2(55),
    # REGISTER_ORGANIZATION VARCHAR2(255),
    # REGISTER_DATE DATE,
    # AGENT_ID NUMBER(22,0),
    segment_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))  # SEGMENT_ID NUMBER(22,0),
    # AGENT_NAME VARCHAR2(255),
    # CONNECTOR_ID NUMBER(22,0),
    # CHANGED_STATUS_DATE DATE,
    # CONNECT_DATE DATE,
    # CONNECTOR_AGENT_ID NUMBER(22,0),
    # EMAIL_NOTIFY VARCHAR2(1) DEFAULT 'Y',
    # EMAIL2_NOTIFY VARCHAR2(1) DEFAULT 'Y',
    fiz_company_id = Column(oracle.NUMBER(), ForeignKey("UN_COMPANY.id_company"))  # FIZ_COMPANY_ID NUMBER(22,0),
    # FIZ_AGENT_ID NUMBER(22,0),

    segment = relationship("DicItem", foreign_keys=[segment_id])

    phones = relationship("FizPhone")
    address = relationship("FizAddress")
    address_connect = relationship("FizAdrConnect", uselist=False)

    services = relationship("Service", viewonly=True)
    documents = relationship("FizDocument")

    change_requests = relationship("FizRequestChange")

    payments = relationship("FizPay")

    tariff_change_requests = relationship("TarifChangeRequest")
    tariff_change_requests_history = relationship("TarifChangeRequestHistory")

    abonements = relationship("FizAbonsActivated")

    tv_ids = relationship("FizTvId")

    provider = relationship("UnCompany", uselist=False)


class FizAbonsActivated(OracleBase):
    __tablename__ = "FIZ_ABONS_ACTIVATED"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)  # "ID" NUMBER,
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"))
    period = Column(oracle.NUMBER(9, 0), nullable=False)  # "PERIOD" NUMBER NOT NULL ENABLE,
    service_id = Column(oracle.NUMBER(), ForeignKey("SERVICE.id"))
    abon_name = Column(oracle.VARCHAR2(255))  # "NAME" VARCHAR2(255) NOT NULL ENABLE,
    price = Column(oracle.FLOAT(126), nullable=False)  # "PRICE" FLOAT(126) NOT NULL ENABLE,
    user_add = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.CLIENT.id"))  # "USER_ADD" NUMBER,
    date_add = Column(oracle.DATE())  # "DATE_ADD" DATE,
    tarif_id = Column(oracle.NUMBER, ForeignKey("IFS_KERNEL.TARIF.id"))  # "TARIF_ID" NUMBER,
    id_speed = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))  # "ID_SPEED" NUMBER,
    # plus_speed = Column(oracle.NUMBER, default=text('0')) # "PLUS_SPEED" NUMBER DEFAULT 0,
    created_date = Column(
        oracle.DATE(), default=datetime.now(), server_default=func.sysdate()
    )  # "CREATED_DATE" DATE DEFAULT sysdate,

    date_end = column_property(func.add_months(date_add, period))


class FizPay(OracleBase):
    __tablename__ = "FIZ_PAY"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)  # "ID" NUMBER,
    id_type = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))  # "ID_TYPE" NUMBER NOT NULL ENABLE,
    summ = Column(oracle.FLOAT(126), nullable=False)  # "SUMM" FLOAT(126) NOT NULL ENABLE,
    created_date = Column(
        oracle.DATE(), default=datetime.now(), server_default=func.sysdate()
    )  # "CREATED_DATE" DATE DEFAULT sysdate,
    created_user_id = Column(oracle.NUMBER(9, 0))  # "CREATED_USER_ID" NUMBER NOT NULL ENABLE,
    comm = Column(oracle.VARCHAR2(255))  # "COMM" VARCHAR2(255),
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"), nullable=False)  # "FIZ_ID" NUMBER,
    direct = Column(oracle.NUMBER(9, 0))  # "DIRECT" NUMBER DEFAULT 0,
    osmp_id = Column(oracle.FLOAT(126))  # "OSMP_ID" FLOAT(126),
    osmp_date = Column(oracle.DATE())  # "OSMP_DATE" DATE,
    gur_date = Column(oracle.DATE())  # "GUR_DATE" DATE,
    gur_end = Column(oracle.VARCHAR2(1), default="Y", server_default="Y")  # "GUR_END" VARCHAR2(1) DEFAULT 'Y',
    osmp_terminal_id = Column(oracle.NUMBER(9, 0))  # "OSMP_TERMINAL_ID" NUMBER,
    dog_num = Column(oracle.VARCHAR2(32))  # "DOG_NUM" VARCHAR2(32),
    accepted_date = Column(oracle.DATE())  # "ACCEPTED_DATE" DATE,
    accepted_user_id = Column(oracle.NUMBER(9, 0))  # "ACCEPTED_USER_ID" NUMBER,
    id_service = Column(oracle.NUMBER(9, 0), ForeignKey("SERVICE.id"))  # "ID_SERVICE" NUMBER,
    balance_type = Column(
        oracle.VARCHAR2(10), default="INET", server_default="INET"
    )  # "BALANCE_TYPE" VARCHAR2(10) DEFAULT 'INET',
    abonement_id = Column(oracle.NUMBER(9, 0))  # "ABONEMENT_ID" NUMBER,

    fiz = relationship("Fiz", foreign_keys=[fiz_id], uselist=False, viewonly=True)
    pay_type = relationship("DicItem", foreign_keys=[id_type], uselist=False)
    service = relationship("Service", foreign_keys=[id_service], uselist=False)


class FizRequestChange(OracleBase):
    __tablename__ = "FIZ_REQUEST_CHANGE"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"))
    table_id = Column(oracle.NUMBER(9, 0))  # "TABLE_ID" NUMBER(9,0),
    table_name = Column(oracle.VARCHAR2(255))  # "TABLE_NAME" VARCHAR2(255),
    column_name = Column(oracle.VARCHAR2(255))  # "COLUMN_NAME" VARCHAR2(255),
    old_value = Column(oracle.VARCHAR2(255))  # "OLD_VALUE" VARCHAR2(255),
    new_value = Column(oracle.VARCHAR2(255))  # "NEW_VALUE" VARCHAR2(255),
    performance_date = Column(oracle.DATE())  # "PERFORMANCE_DATE" DATE,
    user_name = Column(oracle.VARCHAR2(255))  # "USER_NAME" VARCHAR2(255),
    executed_date = Column(oracle.DATE())  # "EXECUTED_DATE" DATE,
    executed = Column(oracle.VARCHAR2(1))  # "EXECUTED" VARCHAR2(1),
    created_date = Column(
        oracle.DATE(), default=datetime.now(), server_default=func.sysdate()
    )  # "CREATED_DATE" DATE DEFAULT sysdate,


class FizDocument(OracleBase):
    __tablename__ = "FIZ_DOCUMENT"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"))
    document = Column(oracle.VARCHAR2(255))
    description = Column(oracle.VARCHAR2(255))
    created = Column(oracle.DATE(), server_default=func.sysdate())
    modified = Column(oracle.DATE(), server_default=func.sysdate())
    created_user_id = Column(oracle.NUMBER(9, 0))
    modified_user_id = Column(oracle.NUMBER(9, 0))
    id_type = Column(oracle.NUMBER())
    id_status = Column(oracle.NUMBER())
    writed = Column(oracle.DATE())
    dog_num = Column(oracle.VARCHAR2(32))
    is_delete = Column(oracle.VARCHAR2(1), server_default=text("N"))
    num = Column(oracle.VARCHAR2(12))
    delete_date = Column(oracle.DATE())
    cancel_date = Column(oracle.DATE())

    fiz = relationship("Fiz", uselist=False)


class FizPhone(OracleBase):
    __tablename__ = "FIZ_PHONE"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"))
    phone = Column(oracle.VARCHAR2(20))
    phone_type_id = Column(oracle.NUMBER(3, 0))
    is_contact = Column(oracle.VARCHAR2(1))
    delete_date = Column(oracle.DATE())
    is_delete = Column(oracle.VARCHAR2(1))
    ext = Column(oracle.VARCHAR2(20))
    belong = Column(oracle.VARCHAR2(1))
    # lu_date = Column(oracle.DATE())
    # sms_notify = Column(oracle.VARCHAR2(1))


class AllAddress(OracleBase):
    __tablename__ = "ALL_ADDRESS"

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    # zip = Column(oracle.VARCHAR2(20))
    city = Column(oracle.VARCHAR2(60))
    street = Column(oracle.VARCHAR2(170))
    house = Column(oracle.VARCHAR2(15))
    building = Column("bulding", oracle.VARCHAR2(15))
    flat = Column(oracle.VARCHAR2(10))
    # post_office_box = Column(oracle.VARCHAR2(10))
    # region = Column(oracle.VARCHAR2(100))
    # country = Column(oracle.VARCHAR2(20))
    # info = Column(oracle.VARCHAR2(255))
    letter = Column(oracle.VARCHAR2(10))

    # tk = Column(oracle.VARCHAR2(100))

    def __repr__(self):
        # addr = "{0}, {1}",{2},{3},{4},{5}".format(self.city, self.street,
        # self.house, self.building, self.flat, self.letter)
        addr = f"{self.city}, {self.street}"
        if self.house and self.house not in ("", " "):
            addr += f", д. {self.house}"
        if self.building and self.building.isalnum():
            addr += f", корп. {self.building}"
        if self.letter and self.letter.isalnum():
            addr += f", лит. {self.letter}"
        if self.flat and self.flat.isalnum():
            addr += f", кв. {self.flat}"

        return addr


class FizAddress(OracleBase):
    __tablename__ = "FIZ_ADDRESS"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012
    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    # zip = Column(oracle.VARCHAR2(20))
    # city = Column(oracle.VARCHAR2(60))
    street = Column(oracle.VARCHAR2(170))
    house = Column(oracle.VARCHAR2(10))
    building = Column(oracle.VARCHAR2(10))
    flat = Column(oracle.VARCHAR2(10))
    # post_office_box = Column(oracle.VARCHAR2(10))
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"))
    address_type_id = Column(oracle.NUMBER(5, 0))
    # region = Column(oracle.VARCHAR2(100))
    # country = Column(oracle.VARCHAR2(20))
    # info = Column(oracle.VARCHAR2(255))
    # is_owner = Column(oracle.VARCHAR2(1))
    # front
    # floor = Column(oracle.NUMBER(22,0))

    fiz = relationship("Fiz")


class FizAdrConnect(OracleBase):
    __tablename__ = "FIZ_ADR_CONNECT"

    adr = Column(oracle.VARCHAR2(170), primary_key=True)
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"), primary_key=True)

    fiz = relationship("Fiz", uselist=False)

    def __str__(self):
        return f"{self.adr}"


class FizTvId(OracleBase):
    __tablename__ = "FIZ_TV_ID"

    fiz_id = Column(
        oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"), primary_key=True
    )  # "FIZ_ID" NUMBER NOT NULL ENABLE,
    tv_id = Column(oracle.VARCHAR2(255))  # "TV_ID" VARCHAR2(255),
    synced = Column(oracle.CHAR(1), default="Y", server_default="Y")  # "SYNCED" CHAR(1),
    synced_date = Column(oracle.DATE())  # "SYNCED_DATE" DATE,
    created_date = Column(
        oracle.DATE(), default=datetime.now(), server_default=func.sysdate()
    )  # "CREATED_DATE" DATE DEFAULT sysdate,
    provider_id = Column(oracle.NUMBER(), primary_key=True)  # "PROVIDER_ID" NUMBER,

    # fiz = relationship("Fiz", uselist=False)


class Tarif(OracleBase):
    __tablename__ = "TARIF"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    name = Column(oracle.VARCHAR2(255))
    id_speed = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    price = Column(oracle.FLOAT(126))  # PRICE FLOAT,
    # COUNT_GB FLOAT DEFAULT 0,
    # PRICE_OVER_GB FLOAT DEFAULT 0,
    # COUNT_IP NUMBER(22,0) DEFAULT 1,
    is_public = Column(oracle.VARCHAR2(1), default="Y", server_default="Y")  # IS_PUBLIC VARCHAR2(20) DEFAULT 'Y',
    count_type = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))  # COUNT_TYPE NUMBER(9,0),
    # CHANGE_RESOLVE VARCHAR2(1),
    # FROM_FDAY VARCHAR2(1),
    # FROM_MIDNIGHT VARCHAR2(1),
    # PREVIOUS_IS VARCHAR2(1),
    id_type_service = Column(
        oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id")
    )  # ID_TYPE_SERVICE NUMBER(9,0) DEFAULT NULL,
    # TARIF_DESCRIPTION VARCHAR2(256),
    # SYNCED_ VARCHAR2(1) DEFAULT 'N',
    archived = Column(oracle.CHAR(1))
    archive_date = Column(oracle.DATE())

    speed_descr = relationship("DicItem", foreign_keys=[id_speed])
    count_type_descr = relationship("DicItem", foreign_keys=[id_speed])
    abonements = relationship("TarifAbons", uselist=True)


class TarifAbons(OracleBase):
    __tablename__ = "TARIF_ABONS"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)  # "ID" NUMBER,
    name = Column(oracle.VARCHAR2(255))  # "NAME" VARCHAR2(255) NOT NULL ENABLE,
    price = Column(oracle.FLOAT(126), nullable=False)  # "PRICE" FLOAT(126) NOT NULL ENABLE,
    period = Column(oracle.NUMBER(9, 0), nullable=False)  # "PERIOD" NUMBER NOT NULL ENABLE,
    id_type_service = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))  # "ID_TYPE_SERVICE" NUMBER,
    tarif_id = Column(oracle.NUMBER, ForeignKey("IFS_KERNEL.TARIF.id"))  # "TARIF_ID" NUMBER,
    # plus_speed = Column(oracle.NUMBER, default=text('0')) # "PLUS_SPEED" NUMBER DEFAULT 0,
    id_speed = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))  # "ID_SPEED" NUMBER,


class TarifChangeRequest(OracleBase):
    __tablename__ = "TARIF_CHANGE_REQUEST"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"), nullable=False)
    old_tarif_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.TARIF.id"), nullable=False)
    new_tarif_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.TARIF.id"), nullable=False)
    name_old = Column(oracle.VARCHAR2(255))
    name_new = Column(oracle.VARCHAR2(255))
    create_request_date = Column(oracle.DATE())
    price_old = Column(oracle.FLOAT(126))
    price_new = Column(oracle.FLOAT(126))
    id_type_service = Column(oracle.NUMBER(8, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"), nullable=False)
    id_service = Column(oracle.NUMBER(9, 0), ForeignKey("SERVICE.id"), nullable=False)
    count_type_old = Column(oracle.NUMBER(8, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    count_type_new = Column(oracle.NUMBER(8, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    performance_date = Column(oracle.DATE())
    new_speed = Column(oracle.VARCHAR2(255))
    old_speed = Column(oracle.VARCHAR2(255))
    user_name = Column(oracle.VARCHAR2(255))


class TarifChangeRequestHistory(OracleBase):
    __tablename__ = "TARIF_CHANGE_REQUEST_HISTORY"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    fiz_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.FIZ.id"), nullable=False)
    old_tarif_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.TARIF.id"), nullable=False)
    new_tarif_id = Column(oracle.NUMBER(9, 0), ForeignKey("IFS_KERNEL.TARIF.id"), nullable=False)
    name_old = Column(oracle.VARCHAR2(255))
    name_new = Column(oracle.VARCHAR2(255))
    create_request_date = Column(oracle.DATE())
    price_old = Column(oracle.FLOAT(126))
    price_new = Column(oracle.FLOAT(126))
    id_type_service = Column(oracle.NUMBER(8, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"), nullable=False)
    id_service = Column(oracle.NUMBER(9, 0), ForeignKey("SERVICE.id"), nullable=False)
    count_type_old = Column(oracle.NUMBER(8, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    count_type_new = Column(oracle.NUMBER(8, 0), ForeignKey("IFS_KERNEL.DIC_ITEM.id"))
    performed_date = Column(oracle.DATE())
    new_speed = Column(oracle.VARCHAR2(255))
    old_speed = Column(oracle.VARCHAR2(255))
    user_name = Column(oracle.VARCHAR2(255))


class TvSubscriptions(OracleBase):
    __tablename__ = "TV_SUBSCRIPTIONS"

    id = Column("id", oracle.NUMBER, primary_key=True)
    name = Column(oracle.VARCHAR2(255), nullable=False)
    is_delete = Column(oracle.VARCHAR2(1), server_default=text("N"))
    create_date = Column(oracle.DATE(), default=datetime.now(), server_default=func.sysdate())
    update_date = Column(oracle.DATE())
    delete_date = Column(oracle.DATE())
    provider_id = Column(oracle.NUMBER)
    fiz_company_id = Column(oracle.NUMBER)


class TvTarifPacket(OracleBase):
    __tablename__ = "TV_TARIF_PACKET"

    id = Column("id", oracle.NUMBER, primary_key=True)
    id_tarif = Column(oracle.NUMBER(), primary_key=True)
    id_packet = Column(oracle.NUMBER(), primary_key=True)
    provider_id = Column(oracle.NUMBER(), primary_key=True)
    fiz_company_id = Column(oracle.NUMBER(), primary_key=True)


class Dic(OracleBase):
    __tablename__ = "DIC"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(8), primary_key=True)
    name = Column(oracle.VARCHAR2(100))
    description = Column(oracle.VARCHAR2(255))

    items = relationship("DicItem")


class DicItem(OracleBase):
    __tablename__ = "DIC_ITEM"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    dic_id = Column("dic_id", oracle.NUMBER(8), ForeignKey("IFS_KERNEL.DIC.id"))
    id = Column("id", oracle.NUMBER(8), primary_key=True)
    name = Column(oracle.VARCHAR2(255))
    description = Column(oracle.VARCHAR2(255))
    is_delete = Column(oracle.VARCHAR2(1))
    # pos = Column(oracle.NUMBER(9,0))
    # editable = Column(oracle.VARCHAR2(1))

    dic = relationship("Dic", foreign_keys=[dic_id], uselist=False)

    def __str__(self):
        # return "({0}){1}".format(self.id, self.name)
        return f"{self.name}"


class UnCompany(OracleBase):
    __tablename__ = "UN_COMPANY"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    name = Column(oracle.VARCHAR2(255))
    description = Column(oracle.VARCHAR2(2000))
    is_delete = Column(oracle.VARCHAR2(1), server_default=text("N"))
    # pos = Column(oracle.NUMBER(9.0))
    with_nds = Column(oracle.VARCHAR2(1), server_default=text("Y"))
    id_company = Column(oracle.NUMBER(), ForeignKey("COMPANY.id"))
    fiz_default = Column(oracle.VARCHAR2(1), server_default=text("N"))
    # img_stamp = Column(oracle.VARCHAR2(255))
    # img_sign_gendir = Column(oracle.VARCHAR2(255))
    # img_sign_glbuh = Column(oracle.VARCHAR2(255))
    # img_logo = Column(oracle.VARCHAR2(255))

    company = relationship("Company", foreign_keys=[id_company], uselist=False)


class Users(OracleBase):
    __tablename__ = "USERS"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)
    login = Column(oracle.VARCHAR2(20))
    password = Column(oracle.VARCHAR2(20))
    fname = Column(oracle.VARCHAR2(20))
    lname = Column(oracle.VARCHAR2(20))
    mname = Column(oracle.VARCHAR2(20))
    user_type_id = Column(oracle.NUMBER(3, 0))
    user_group_id = Column(oracle.NUMBER(4, 0))
    is_logged_in = Column(oracle.VARCHAR2(1), server_default=text("N"))
    last_activity = Column(oracle.DATE())  # LAST_ACTIVITY DATE,
    department_id = Column(oracle.NUMBER())  # DEPARTMENT_ID NUMBER,
    changed_date = Column(oracle.DATE())  # CHANGED_DATE DATE,
    email = Column(oracle.VARCHAR2(50))  # EMAIL VARCHAR2(50),
    personal_phone = Column(oracle.VARCHAR2(30))  # PERSONAL_PHONE VARCHAR2(30),
    delete_date = Column(oracle.DATE())  # DELETE_DATE DATE,
    description = Column(oracle.VARCHAR2(50))  # DESCRIPTION VARCHAR2(50),
    agent_id = Column(oracle.VARCHAR2(10))  # AGENT_ID VARCHAR2(10),
    ip = Column(oracle.VARCHAR2(16))  # IP VARCHAR2(16),
    is_block = Column(oracle.VARCHAR2(1), server_default=text("N"))  # IS_BLOCK CHAR(1) DEFAULT 'N' ,
    is_delete = Column(oracle.VARCHAR2(1), server_default=text("N"))  # IS_DELETE CHAR(1) DEFAULT 'N' ,
    use_cti = Column(oracle.VARCHAR2(1), server_default=text("N"))  # USE_CTI CHAR(1) DEFAULT 'N',
    branch_id = Column(oracle.NUMBER(3, 0))  # BRANCH_ID NUMBER(3,0),
    client_id = Column(oracle.NUMBER(), ForeignKey("IFS_KERNEL.CLIENT.id"))  # CLIENT_ID NUMBER,
    send_email = Column(oracle.VARCHAR2(1), server_default=text("Y"))  # SEND_EMAIL VARCHAR2(1) DEFAULT 'Y',
    head_user_id = Column(oracle.NUMBER())  # HEAD_USER_ID NUMBER,


class StreetDbf(OracleBase):
    __tablename__ = "STREET_DBF"

    id = Column("id", oracle.NUMBER(), primary_key=True)
    name = Column(oracle.VARCHAR2(160))
    socr = Column(oracle.VARCHAR2(10))
    code = Column(oracle.VARCHAR2(19))
    index_ = Column(oracle.VARCHAR2(6))
    gninmb = Column(oracle.VARCHAR2(4))
    uno = Column(oracle.VARCHAR2(4))
    ocatd = Column(oracle.VARCHAR2(11))


class FizStatServices(OracleBase):
    __tablename__ = "FIZ_STAT_SERVICES"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(), primary_key=True)  # ID NUMBER,
    timestamp = Column("timestamp", oracle.DATE(), server_default=func.sysdate())  # "TIMESTAMP" DATE DEFAULT sysdate,
    fiz_company_id = Column(
        "fiz_company_id", oracle.NUMBER(), ForeignKey("UN_COMPANY.id_company")
    )  # FIZ_COMPANY_ID NUMBER,
    service_type_id = Column(
        "service_type_id", oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id")
    )  # SERVICE_TYPE_ID NUMBER,
    service_status_id = Column(
        "service_status_id", oracle.NUMBER(), ForeignKey("IFS_KERNEL.DIC_ITEM.id")
    )  # SERVICE_STATUS_ID NUMBER,
    counter = Column("counter", oracle.NUMBER())  # COUNTER NUMBER

    fiz_company = relationship("UnCompany", foreign_keys=[fiz_company_id], uselist=False)
    service_type = relationship("DicItem", foreign_keys=[service_type_id], uselist=False)
    service_status = relationship("DicItem", foreign_keys=[service_status_id], uselist=False)


class FizStatUsers(OracleBase):
    __tablename__ = "FIZ_STAT_USERS"
    __table_args__ = {"schema": "IFS_KERNEL"}  # noqa: RUF012

    id = Column("id", oracle.NUMBER(), primary_key=True)  # ID NUMBER,
    timestamp = Column("timestamp", oracle.DATE(), server_default=func.sysdate())  # "TIMESTAMP" DATE DEFAULT sysdate,
    fiz_company_id = Column(
        "fiz_company_id", oracle.NUMBER(), ForeignKey("UN_COMPANY.id_company")
    )  # FIZ_COMPANY_ID NUMBER,
    counter = Column("counter", oracle.NUMBER())  # COUNTER NUMBER

    fiz_company = relationship("UnCompany", foreign_keys=[fiz_company_id], uselist=False)


class UnitContact(OracleBase):
    __tablename__ = "UNIT_CONTACT"

    id = Column("id", oracle.NUMBER(9, 0), primary_key=True)  # "ID" NUMBER(9,0) NOT NULL ENABLE,
    phone = Column("phone", oracle.VARCHAR(32))  # "PHONE" VARCHAR2(32),
    email = Column("email", oracle.VARCHAR(32))  # "EMAIL" VARCHAR2(32),
    comm = Column("comm", oracle.VARCHAR2(500))  # "COMM" VARCHAR2(500),
    is_delete = Column(
        "is_delete", oracle.VARCHAR2(1), default="N", server_default=text("N")
    )  # "IS_DELETE" VARCHAR2(1) DEFAULT 'N',
    id_unit = Column("id_unit", oracle.NUMBER(), ForeignKey("UNIT.id"))  # "ID_UNIT" NUMBER,

    unit = relationship("Unit", foreign_keys=[id_unit], viewonly=True)
