import React, {useEffect, useState} from 'react';
import {Button, Collapse, Descriptions, Flex, List, Modal, Table} from 'antd';
import axios from "axios";

export default function CompanyCard(data) {
    const apiUrl = import.meta.env.VITE_API_URL
    const isMobile = data.isMobile

    const [isGettingData, setIsGettingData] = useState(true);
    const [items, setItems] = useState([]);
    const [isContactsOpen, setIsContactsOpen] = useState(false);
    const [contactsItems, setContactsItems] = useState([]);

    const showContacts = (companyId) => {
        (async () => {
            const contacts = await getContacts(companyId)
            setContactsItems(contacts.map((contact, i) => (
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
                                        <li key={i}>{phone.ext ? `${phone.phone} (доб. ${phone.ext})` : phone.phone}</li>))}</ul> : "-",
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
            )))
            setIsContactsOpen(true)
        })();
    }

    const hideContacts = () => {
        (async () => {
            setContactsItems([])
            setIsContactsOpen(false)
        })();
    }

    const getContacts = async (companyId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/search/contact?company_id=${companyId}`
            );

            return response.data
        } catch (error) {
            console.error(error)
        }
    };

    const getCompanies = async () => {
        let tempCompanies = []
        for (const i in data.companyIds) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/${data.companyIds[i]}`
                );

                tempCompanies.push(response.data)
            } catch (error) {
                console.error(error)
            }
        }
        setIsGettingData(false)
        return tempCompanies
    };

    useEffect(() => {
        (async () => {
            const companies = await getCompanies();
            if (companies.length === 0) {
                setIsGettingData(true)
                return
            }

            setItems(companies.map((company, i) => ({
                key: i,
                client: company.client,
                brand: company.brandName,
                type: company.type.name,
                status: company.status.name,
                provider: company.provider,
                contactsButton: <Button onClick={() => showContacts(company.id)}>Контакты</Button>,
            })))
        })();
    }, [data.companyIds]);

    if (isGettingData) {
        return <></>
    }

    return (
        <>
            <Modal open={isContactsOpen} onCancel={hideContacts} footer={null} width={isMobile ? '95%' : '70%'}>
                {contactsItems}
            </Modal>
            {!isGettingData ? <Collapse
                size='small'
                items={[{
                    label: <b>Компании</b>,
                    children: (
                        <Table
                            dataSource={items}
                            size='small'
                            scroll={{
                                x: 500
                            }}
                            pagination={false}
                            columns={[
                                {
                                    title: 'Клиент',
                                    dataIndex: 'client'
                                },
                                {
                                    title: 'Торговая марка',
                                    dataIndex: 'brand'
                                },
                                {
                                    title: 'Тип',
                                    dataIndex: 'type'
                                },
                                {
                                    title: 'Статус',
                                    dataIndex: 'status'
                                },
                                {
                                    title: 'Провайдер',
                                    dataIndex: 'provider'
                                },
                                {
                                    title: '',
                                    dataIndex: 'contactsButton'
                                },
                            ]}
                        />
                    )
                }]}
            /> : null}
        </>
    )
}
