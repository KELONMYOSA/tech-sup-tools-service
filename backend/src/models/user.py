from pydantic import BaseModel


class User(BaseModel):
    cn: str | None
    gecos: str | None
    mail: str | None
    telephoneNumber: str | None
    title: str | None
    uid: str | None
    gidNumber: int | None
