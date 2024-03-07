from contextlib import contextmanager

import cx_Oracle
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.config import settings
from src.database.base import OracleBase

cx_Oracle.init_oracle_client(lib_dir=r"C:\instantclient_21_13")

oracle_engine = create_engine(settings.ORACLE_DB_URL)
OracleSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=oracle_engine)


def init_db():
    OracleBase.metadata.create_all(bind=oracle_engine)


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
