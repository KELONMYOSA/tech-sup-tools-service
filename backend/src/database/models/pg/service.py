from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import relationship

from src.database.base import PostgresBase


class ServiceType(PostgresBase):
    __tablename__ = "service_type"

    id = Column(postgresql.INTEGER, primary_key=True, unique=True, nullable=False)
    name = Column(postgresql.TEXT, nullable=False)

    services = relationship("Service", backref="service_type")


class Service(PostgresBase):
    __tablename__ = "service"

    id = Column(postgresql.INTEGER, primary_key=True, unique=True, nullable=False)
    type_id = Column(postgresql.INTEGER, ForeignKey("service_type.id"), nullable=False)

    service_type = relationship("ServiceType", backref="services")
    wifi_setup_service = relationship("WifiSetupService", uselist=False, backref="service")


class WifiSetupService(PostgresBase):
    __tablename__ = "wifi_setup_service"

    id = Column(
        postgresql.INTEGER, ForeignKey("service.id", ondelete="CASCADE"), primary_key=True, unique=True, nullable=False
    )
    type = Column(postgresql.TEXT, nullable=False)
    controller_domain = Column(postgresql.TEXT, nullable=False)
    router_domain = Column(postgresql.TEXT, nullable=False)
    equipment_domain = Column(postgresql.TEXT, nullable=False)
    ssid = Column(postgresql.TEXT, nullable=False)

    service = relationship("Service", backref="wifi_setup_service")
