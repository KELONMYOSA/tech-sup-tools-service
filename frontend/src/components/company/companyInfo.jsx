import axios from "axios";
import {Card, Col, Collapse, Descriptions, Row, Table, Typography} from "antd";
import React from "react";
import CompanyServicesTable from "./companyServicesTable.jsx";
import CopyToClipboardButton from "../../utils/components.jsx";

export default async function CompanyInfo(data) {
    const apiUrl = import.meta.env.VITE_API_URL
    const companyId = data.companyId

    const getCompanyInfo = async (companyId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/company/${companyId}`
            );

            return response.data
        } catch (error) {
            return null
        }
    };

    const company = await getCompanyInfo(companyId)
    if (!company) {
        return [false, null]
    }

    const companyDescriptionItem = (
        <Card
            title={
                <CopyToClipboardButton
                    text={companyId}
                    type='text'
                    style={{padding: 0}}
                    item={
                        <Typography.Title style={{marginTop: 8}} level={3}>
                            {`Компания ID: ${companyId}`}
                        </Typography.Title>
                    }
                />
            }
        >
            <Descriptions
                title='Информация'
                size='small'
                column={1}
                items={[
                    {
                        label: 'Клиент',
                        children: company.client,
                    },
                    {
                        label: 'Торговая марка',
                        children: company.brandName,
                    },
                    {
                        label: 'Тип',
                        children: company.type ? company.type.name : null,
                    },
                    {
                        label: 'Статус',
                        children: company.status ? company.status.name : null,
                    },
                    {
                        label: 'Провайдер',
                        children: company.provider,
                    },
                    {
                        label: 'Менеджер',
                        children: company.manager ? `${company.manager.lname || ''} ${company.manager.fname || ''} ${company.manager.mname || ''}` : '-',
                    },
                    {
                        label: (
                            <>
                                Персональный
                                <br/>
                                менеджер
                                <br/>
                            </>
                        ),
                        children: company.managerService ? `${company.managerService.lname || ''} ${company.managerService.fname || ''} ${company.managerService.mname || ''}` : '-',
                    },
                ]}
            />
        </Card>
    )

    const getContacts = async (companyId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/contact/byCompany/${companyId}`
            );

            return response.data
        } catch (error) {
        }
    };

    const contacts = await getContacts(companyId)
    let companyContactsItem = null
    if (contacts) {
        companyContactsItem = (
            <Collapse
                items={[
                    {
                        label: 'Контакты',
                        children:
                            <Table
                                size='small'
                                pagination={false}
                                scroll={{x: 600}}
                                columns={[
                                    {
                                        title: 'ФИО',
                                        dataIndex: 'name',
                                    },
                                    {
                                        title: 'Телефон',
                                        dataIndex: 'phone',
                                    },
                                    {
                                        title: 'Email',
                                        dataIndex: 'email',
                                    },
                                    {
                                        title: 'Тип',
                                        dataIndex: 'type',
                                    },
                                    {
                                        title: 'Должность',
                                        dataIndex: 'position',
                                    },
                                    {
                                        title: 'Оповещать',
                                        dataIndex: 'sendAlarm',
                                    },
                                    {
                                        title: 'Комментарии',
                                        dataIndex: 'comments',
                                    },
                                ]}
                                dataSource={
                                    contacts.map(contact => ({
                                        name: `${contact.name.lName} ${contact.name.fName ? contact.name.fName : ''} ${contact.name.mName ? contact.name.mName : ''}`,
                                        phone: contact.phones ?
                                            <ul style={{marginLeft: 10}}>{contact.phones.map((phone, i) => (
                                                <li key={i}>{phone.ext ? `7${phone.phone} (доб. ${phone.ext})` : `7${phone.phone}`}</li>))}</ul>
                                            : "-",
                                        email: contact.email ? contact.email : '-',
                                        type: contact.type ? contact.type : '-',
                                        position: contact.position ? contact.position : '-',
                                        sendAlarm: contact.send_alarm ? 'Да' : 'Нет',
                                        comments: contact.comments ? contact.comments : '-',
                                    }))
                                }
                            />
                    }
                ]}
            />
        )
    }


    return [true,
        <>
            <Row>
                <Col xs={24} md={10} lg={7} style={{padding: 20}}>
                    {companyDescriptionItem}
                </Col>
                <Col xs={24} md={14} lg={17} style={{padding: 20}}>
                    {companyContactsItem}
                </Col>
            </Row>
            <Row>
                <Col flex='auto' style={{padding: 20}}>
                    <CompanyServicesTable companyId={companyId}/>
                </Col>
            </Row>
        </>
    ]
}