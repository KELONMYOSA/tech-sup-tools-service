import ipaddress

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
async def search_by_company_id(
    company_id: str,
    max_results: int = 10,
    exact_match: bool = False,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if exact_match:
        query = {"size": max_results, "query": {"term": {"company_id": company_id}}}
    else:
        query = {"size": max_results, "query": {"match": {"company_id": company_id}}}
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(company_id, "c_id")


@router.get("/service/id/{service_id}")
async def search_by_service_id(
    service_id: str,
    max_results: int = 10,
    exact_match: bool = False,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if exact_match:
        query = {"size": max_results, "query": {"term": {"service_id": service_id}}}
    else:
        query = {"size": max_results, "query": {"match": {"service_id": service_id}}}
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(service_id, "s_id")


@router.get("/company/name")
async def search_by_company_name(name: str, max_results: int = 10, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "size": max_results,
        "query": {
            "bool": {
                "should": [
                    {"match": {"company_name": {"query": name, "fuzziness": "AUTO"}}},
                    {"wildcard": {"company_name": f"*{name}*"}},
                ],
                "minimum_should_match": 1,
            }
        },
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(name, "c_name")


@router.get("/address")
async def search_by_address(address: str, max_results: int = 10, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "size": max_results,
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
        },
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company or service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(address, "address")


@router.get("/service/address")
async def search_by_service_address(address: str, max_results: int = 10, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "size": max_results,
        "query": {
            "bool": {
                "should": [
                    {"match": {"service_address": {"query": address, "fuzziness": "AUTO"}}},
                    {"wildcard": {"service_address": f"*{address}*"}},
                ],
                "minimum_should_match": 1,
            }
        },
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(address, "address")


@router.get("/company/address")
async def search_by_company_address(address: str, max_results: int = 10, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "size": max_results,
        "query": {
            "bool": {
                "should": [
                    {"match": {"company_address": {"query": address, "fuzziness": "AUTO"}}},
                    {"wildcard": {"company_address": f"*{address}*"}},
                ],
                "minimum_should_match": 1,
            }
        },
    }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(address, "address")


@router.get("/service/ip")
async def search_by_service_ip(ip: str, max_results: int = 10, _: User = Depends(get_current_user)):  # noqa: B008
    query = {"size": max_results, "query": {"wildcard": {"service_interface_host": f"*{ip}*"}}}
    try:
        ip_styled = int(ipaddress.ip_address(ip.split("/")[0]))
        if "/" in ip:
            query = {
                "size": max_results,
                "query": {
                    "bool": {
                        "should": [
                            {"wildcard": {"service_subnet": f"{ip_styled}*"}},
                            {"wildcard": {"service_interface_host": f"*{ip}*"}},
                        ],
                        "minimum_should_match": 1,
                    }
                },
            }
        else:
            script_source = f"""
String subnet = params['_source']['service_subnet'];
if (subnet == null) return 0;

int indexSlash = subnet.indexOf('/');
String subnetIP = subnet.substring(0, indexSlash);
String subnetMask = subnet.substring(indexSlash + 1);

long storedIp = Long.parseLong(subnetIP);
int maskLength = Integer.parseInt(subnetMask);

long mask = 0xFFFFFFFFL << (32 - maskLength);

long queryIp = {ip_styled}L;

long network = storedIp & mask;
long broadcast = network | ~mask;

return (queryIp & mask) == (storedIp & mask) ? 1 : 0;
        """
            query = {
                "size": max_results,
                "min_score": "0.5",
                "query": {
                    "bool": {
                        "should": [
                            {
                                "script_score": {
                                    "query": {"match_all": {}},
                                    "script": {"source": script_source, "lang": "painless"},
                                }
                            },
                            {"wildcard": {"service_interface_host": f"*{ip}*"}},
                        ],
                        "minimum_should_match": 1,
                    }
                },
            }
    except:  # noqa: E722
        pass
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(ip, "ip")


@router.get("/phone")
async def search_by_phone(
    phone: str,
    max_results: int = 10,
    exact_match: bool = False,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if exact_match:
        query = {
            "size": max_results,
            "query": {
                "bool": {
                    "should": [
                        {"term": {"company_phone": phone}},
                        {"term": {"client_phone": phone}},
                        {"term": {"service_phone": phone}},
                        {"term": {"service_phone_end": phone}},
                    ],
                    "minimum_should_match": 1,
                }
            },
        }
    else:
        query = {
            "size": max_results,
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
            },
        }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company or service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(phone, "phone")


@router.get("/service/phone")
async def search_service_by_phone(
    phone: str,
    max_results: int = 10,
    exact_match: bool = False,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if exact_match:
        query = {
            "size": max_results,
            "query": {
                "bool": {
                    "should": [
                        {"term": {"service_phone": phone}},
                        {"term": {"service_phone_end": phone}},
                    ],
                    "minimum_should_match": 1,
                }
            },
        }
    else:
        query = {
            "size": max_results,
            "query": {
                "bool": {
                    "should": [
                        {"wildcard": {"service_phone": f"*{phone}*"}},
                        {"wildcard": {"service_phone_end": f"*{phone}*"}},
                    ],
                    "minimum_should_match": 1,
                }
            },
        }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(phone, "phone")


@router.get("/company/phone")
async def search_company_by_phone(
    phone: str,
    max_results: int = 10,
    exact_match: bool = False,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if exact_match:
        query = {
            "size": max_results,
            "query": {
                "bool": {
                    "should": [
                        {"term": {"company_phone": phone}},
                        {"term": {"client_phone": phone}},
                    ],
                    "minimum_should_match": 1,
                }
            },
        }
    else:
        query = {
            "size": max_results,
            "query": {
                "bool": {
                    "should": [
                        {"wildcard": {"company_phone": f"*{phone}*"}},
                        {"wildcard": {"client_phone": f"*{phone}*"}},
                    ],
                    "minimum_should_match": 1,
                }
            },
        }
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(phone, "phone")


@router.get("/service/vlan/{vlan}")
async def search_by_vlan(
    vlan: str,
    max_results: int = 10,
    exact_match: bool = False,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if exact_match:
        query = {"size": max_results, "query": {"term": {"service_vlan": vlan}}}
    else:
        query = {"size": max_results, "query": {"match": {"service_vlan": vlan}}}
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(vlan, "vlan")


@router.get("/service/equipment/{equip}")
async def search_by_equipment(
    equip: str,
    max_results: int = 10,
    exact_match: bool = False,
    _: User = Depends(get_current_user),  # noqa: B008
):
    if exact_match:
        query = {"size": max_results, "query": {"term": {"service_interface_equipment.keyword": equip}}}
    else:
        query = {"size": max_results, "query": {"match": {"service_interface_equipment": equip}}}
    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(equip, "equipment")


@router.get("/all")
async def search_all(text: str, max_results: int = 10, _: User = Depends(get_current_user)):  # noqa: B008
    query = {
        "size": max_results,
        "query": {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            "query": text,
                            "fields": "*",
                            "type": "best_fields",
                        }
                    },
                    {"wildcard": {"company_name": {"value": f"*{text}*"}}},
                    {"wildcard": {"service_address": {"value": f"*{text}*"}}},
                    {"wildcard": {"company_address": {"value": f"*{text}*"}}},
                    {"wildcard": {"service_interface_host": {"value": f"*{text}*"}}},
                    {"wildcard": {"company_phone": {"value": f"*{text}*"}}},
                    {"wildcard": {"client_phone": {"value": f"*{text}*"}}},
                    {"wildcard": {"service_phone": {"value": f"*{text}*"}}},
                    {"wildcard": {"service_phone_end": {"value": f"*{text}*"}}},
                ],
                "minimum_should_match": 1,
            }
        },
    }

    response = es.search(index="company_service_index", body=query)
    if response["hits"]["total"]["value"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company or service not found")
    data = ESDataManager()
    data.create_from_response(response["hits"]["hits"])
    return data.make_response(text, "all")
