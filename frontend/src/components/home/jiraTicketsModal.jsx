import {Alert, Card, Flex, Modal, Spin} from "antd";
import React, {useEffect, useState} from "react";
import axios from "axios";

export default function JiraTicketsModal({isOpen, closeModal, companyIds}) {
    const apiUrl = import.meta.env.VITE_API_URL
    const jiraUrl = import.meta.env.VITE_JIRA_URL
    const [jiraIssues, setJiraIssues] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getJiraIssues = async (companyId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/jira/company/${companyId}`
            );

            return response.data
        } catch (error) {
            return []
        }
    };

    useEffect(() => {
        getDataIf: if (isOpen === true && jiraIssues === null) {
            if (Object.keys(companyIds).length > 10) {
                setJiraIssues(
                    <Flex justify="center" align="center" style={{width: '100%'}}>
                        <Alert message="Компаний слишком много в результатах поиска! (max: 10)" type="error"/>
                    </Flex>
                )
                setIsLoading(false)
                break getDataIf
            }

            (async () => {
                const jiraItems = []
                for (const [id, name] of Object.entries(companyIds)) {
                    const jira = await getJiraIssues(id)
                    const jiraOpen = jira.filter((issue) => issue.status !== 'Решено')
                    if (jiraOpen.length > 0) {
                        jiraItems.push(
                            <Card key={id} title={name} size='small' style={{marginBottom: 10}}>
                                <ul style={{marginLeft: 10, listStyle: 'none'}}>
                                    {jiraOpen.map((issue, i) => (
                                        <li key={i}>
                                            <a target='_blank'
                                               href={`${jiraUrl}/browse/${issue.key}`}>{`[${issue.key}] ${issue.summary} (${issue.status})`}</a>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )
                    }
                }

                if (jiraItems.length === 0) {
                    setJiraIssues(
                        <Flex justify="center" align="center" style={{width: '100%', height: '100%'}}>
                            <Alert message="Открытые задачи не были найдены!" type="info"/>
                        </Flex>
                    )
                } else {
                    setJiraIssues(jiraItems)
                }
                setIsLoading(false)
            })()
        }
    }, [isOpen])

    return (
        <Modal title="Открытые задачи в Jira"
               open={isOpen}
               onCancel={closeModal}
               footer={null}
               style={{minWidth: '60%'}}
        >
            {
                isLoading ?
                    <Flex justify="center" align="center" style={{width: '100%', height: '100px'}}>
                        <Spin/>
                    </Flex>
                    :
                    jiraIssues
            }
        </Modal>
    )
}
