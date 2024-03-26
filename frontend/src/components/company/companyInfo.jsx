import axios from "axios";
import {Card, Col, Collapse, Descriptions, Row} from "antd";
import React from "react";
import CompanyServicesTable from "./companyServicesTable.jsx";

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
        <Card size='small'>
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
                        children: company.type.name,
                    },
                    {
                        label: 'Статус',
                        children: company.status.name,
                    },
                    {
                        label: 'Провайдер',
                        children: company.provider,
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
                        children: contacts.map((contact, i) => (
                                <div key={i}>
                                    <Descriptions
                                        key={i}
                                        bordered
                                        size='small'
                                        title={`${contact.name.lName} ${contact.name.fName ? contact.name.fName : ''} ${contact.name.mName ? contact.name.mName : ''}`}
                                        items={[
                                            {
                                                label: 'Телефон',
                                                children: contact.phones ?
                                                    <ul style={{marginLeft: 10}}>{contact.phones.map((phone, i) => (
                                                        <li key={i}>{phone.ext ? `7${phone.phone} (доб. ${phone.ext})` : `7${phone.phone}`}</li>))}</ul> : "-",
                                            },
                                            {
                                                label: 'email',
                                                children: contact.email ? contact.email : '-',
                                            },
                                            {
                                                label: 'Тип',
                                                children: contact.type ? contact.type : '-',
                                            },
                                            {
                                                label: 'Должность',
                                                children: contact.position ? contact.position : '-',
                                            },
                                            {
                                                label: 'Оповещать',
                                                children: contact.send_alarm ? 'Да' : 'Нет',
                                            },
                                            {
                                                label: 'Комментарии',
                                                children: contact.comments ? contact.comments : '-',
                                            },
                                        ]}
                                    />
                                    <br/>
                                </div>
                            )
                        )
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