import platform
from contextlib import contextmanager

import cx_Oracle
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.config import settings
from src.database.base import MariaBase, OracleBase

if platform.system() == "Windows":
    cx_Oracle.init_oracle_client(lib_dir=r"C:\instantclient_21_13")
elif platform.system() == "Linux":
    cx_Oracle.init_oracle_client(lib_dir=r"/opt/oracle/instantclient_21_13")

oracle_engine = create_engine(settings.ORACLE_DB_URL)
OracleSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=oracle_engine)

maria_engine = create_engine(settings.MARIA_DB_URL)
MariaSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=maria_engine)


def init_db():
    OracleBase.metadata.create_all(bind=oracle_engine)
    MariaBase.metadata.create_all(bind=maria_engine)


@contextmanager
def oracle_db():
    db = OracleSessionLocal()
    try:
        yield db
    except:
        db.rollback()
        raise
    finally:
        db.close()


@contextmanager
def maria_db():
    db = MariaSessionLocal()
    try:
        yield db
    except:
        db.rollback()
        raise
    finally:
        db.close()
