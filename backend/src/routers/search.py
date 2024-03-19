from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, HTTPException, status

from src.config import settings
from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.es_data import ESDataManager

router = APIRouter(
    prefix="/search",
    tags=["Search"],
)

es = Elasticsearch(settings.ES_URL)


@router.get("/company/id/{company_id}")
async def search_by_company_id(company_id: str, _: User = Depends(get_current_user)):  # noqa: B008
    query = {"query": {"match": {"company_id": company_id}}}
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response()


@router.get("/service/id/{service_id}")
async def search_by_service_id(service_id: str, _: User = Depends(get_current_user)):  # noqa: B008
    query = {"query": {"match": {"service_id": service_id}}}
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response()


@router.get("/company/name")
async def search_by_company_name(name: str, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "query": {
            "bool": {
                "should": [
                    {"match": {"company_name": {"query": name, "fuzziness": "AUTO"}}},
                    {"wildcard": {"company_name": f"*{name}*"}},
                ],
                "minimum_should_match": 1,
            }
        }
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response()


@router.get("/service/address")
async def search_by_service_address(address: str, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "query": {
            "bool": {
                "should": [
                    {"match": {"service_address": {"query": address, "fuzziness": "AUTO"}}},
                    {"wildcard": {"service_address": f"*{address}*"}},
                    {"match": {"company_address": {"query": address, "fuzziness": "AUTO"}}},
                    {"wildcard": {"company_address": f"*{address}*"}},
                ],
                "minimum_should_match": 1,
            }
        }
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company or service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response()


@router.get("/service/ip")
async def search_by_service_ip(ip: str, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "query": {
            "bool": {
                "should": [
                    {"wildcard": {"service_subnet": f"*{ip}*"}},
                    {"wildcard": {"service_interface_host": f"*{ip}*"}},
                ],
                "minimum_should_match": 1,
            }
        }
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response()


@router.get("/phone")
async def search_by_phone(phone: str, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "query": {
            "bool": {
                "should": [
                    {"wildcard": {"company_phone": f"*{phone}*"}},
                    {"wildcard": {"client_phone": f"*{phone}*"}},
                    {"wildcard": {"service_phone": f"*{phone}*"}},
                    {"wildcard": {"service_phone_end": f"*{phone}*"}},
                ],
                "minimum_should_match": 1,
            }
        }
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company or service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response()
