import React, {useEffect, useState} from 'react';
import {Button, Collapse, Descriptions, Flex, Modal} from 'antd';
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
                                children: contact.phones ? <ul style={{marginLeft: 10}}>{contact.phones.map((phone, i) => (
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
            }

            setItems(companies.map(company => ({
                label: company.client,
                children: (
                    <Flex justify="space-between" style={{width: '100%'}}>
                        <div>
                            <p><b>Клиент:</b> {company.client}</p>
                            {company.brandName ? <p><b>Торговая марка:</b> {company.brandName}</p> : null}
                            <p><b>Тип:</b> {company.type.name}</p>
                            <p><b>Статус:</b> {company.status.name}</p>
                            <p><b>Провайдер:</b> {company.provider}</p>
                        </div>
                        <Button onClick={() => showContacts(company.id)}>Контакты</Button>
                    </Flex>
                )
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
            {!isGettingData ? <Collapse items={items} defaultActiveKey={['0']} style={{marginTop: 20}}/> : null}
        </>
    )
}
