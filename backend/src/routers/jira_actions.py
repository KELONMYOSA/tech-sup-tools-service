from fastapi import APIRouter, Depends, HTTPException, status
from jira import JIRA

from src.config import settings
from src.models.user import User
from src.utils.auth import get_current_user
from src.utils.jira_utils import JIRAIssueCreateData, create_issue, get_issues_by_service_id

router = APIRouter(
    prefix="/jira",
    tags=["Jira"],
)

jira_options = {"server": settings.JIRA_URL}
try:
    jira = JIRA(options=jira_options, basic_auth=(settings.JIRA_USER, settings.JIRA_PASSWORD))
except Exception as e:
    print("Unable connect to Jira!")
    print(e)
    jira = None


def _check_jira(jira):
    if not jira:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Unable connect to Jira")


# Поиск задачи в jira по id услуги
@router.get("/{service_id}")
async def issues_by_service_id(service_id: int, _: User = Depends(get_current_user)):  # noqa: B008
    _check_jira(jira)
    result = get_issues_by_service_id(jira, service_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issues not found")
    return result


# Создание задачи в SUPPORT
@router.post("/")
async def support_issue_create(data: JIRAIssueCreateData, _: User = Depends(get_current_user)):  # noqa: B008
    _check_jira(jira)
    data.project = "SUPPORT"
    data.issue_type = "Задача"
    data.assignee = "tp"
    result, msg = create_issue(jira, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {"key": msg}
