from jira import JIRA, Issue, JIRAError
from jira.client import ResultList
from pydantic import BaseModel


def get_issues_by_service_id(jira: JIRA, service_id: int) -> list[dict]:
    issues = jira.search_issues(f'"ID Услуги" ~ "{service_id}"')
    return _result_list_to_dict_list(issues)


class JIRAIssueCreateData(BaseModel):
    project: str | None = None
    issue_type: str | None = None
    priority: str | None = None
    assignee: str | None = None
    summary: str | None = None
    description: str | None = None
    service_id: str | None = None
    extra_fields: dict | None = None


def create_issue(jira: JIRA, data: JIRAIssueCreateData) -> (bool, str):
    try:
        issue = jira.create_issue(
            project=data.project,
            issuetype={"name": data.issue_type},
            priority={"name": data.priority},
            assignee={"name": data.assignee},
            summary=data.summary,
            description=data.description,
            customfield_11702=data.service_id,
            **data.extra_fields,
        )
        return True, issue.key
    except JIRAError as e:
        return False, e.response.text


def _result_list_to_dict_list(rl: ResultList[Issue]) -> list[dict]:
    result = []
    for issue in rl:
        result.append(
            {
                "key": issue.key,
                "status": issue.fields.status.name,
                "priority": issue.fields.priority.name,
                "summary": issue.fields.summary,
                "description": issue.fields.description,
                "assignee": issue.fields.assignee.displayName,
            }
        )
    return result
