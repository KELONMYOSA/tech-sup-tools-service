import {Button, Modal, Table, Tooltip, Typography} from "antd";
import React, {useEffect, useState} from "react";
import axios from "axios";
import ServiceInfo from "./serviceInfo.jsx";

export default function ServiceCard(data) {
    const apiUrl = import.meta.env.VITE_API_URL
    const isMobile = data.isMobile

    const [isGettingData, setIsGettingData] = useState(true);
    const [serviceTable, setServiceTable] = useState(null);
    const [isServiceOpen, setIisServiceOpen] = useState(false);
    const [serviceItems, setServiceItems] = useState([]);

    const getServices = async () => {
        let services = []
        for (const i in data.companyIds) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service?company_id=${data.companyIds[i]}`
                );

                services.push(response.data)
            } catch (error) {
                console.error(error)
            }
        }
        setIsGettingData(false)
        return services
    };

    const showService = (serviceId) => {
        (async () => {
            await ServiceInfo({serviceId: serviceId, setServiceItems: setServiceItems, setIisServiceOpen: setIisServiceOpen})
        })()
    }

    const hideService = () => {
        (async () => {
            setServiceItems([])
            setIisServiceOpen(false)
        })();
    }

    useEffect(() => {
        (async () => {
            const services = await getServices();
            if (services.length === 0) {
                setIsGettingData(true)
            }

            let allServices = []
            for (const i in services) {
                allServices = allServices.concat(services[i].active)
                allServices = allServices.concat(services[i].disabled)
            }

            const servicesData = allServices.map(service => ({
                key: service.id,
                id: (
                    <Tooltip title="Подробнее">
                        <Button type='text' onClick={() => showService(service.id)}>{service.id}</Button>
                    </Tooltip>
                ),
                type: service.type,
                status: service.status.name,
                date: service.statusDate,
                addresses: (
                    <ul>
                        {service.addresses.map((address, i) => (
                            <li key={i}>{
                                `${address.city}${!['', ' '].includes(address.street) ? `, ${address.street}` : ''}${!['', ' '].includes(address.house) ? `, ${address.house}` : ''}${!['', ' '].includes(address.building) ? `, ${address.building}` : ''}${!['', ' '].includes(address.letter) ? ` ${address.letter}` : ''}${!['', ' '].includes(address.flat) ? `, ${address.flat}` : ''}`
                            }</li>
                        ))}
                    </ul>)
            }))

            setServiceTable(
                <Table
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'id',
                            defaultSortOrder: 'descend',
                            sorter: (a, b) => a.key - b.key,
                        },
                        {
                            title: 'Название',
                            dataIndex: 'type'
                        },
                        {
                            title: 'Статус',
                            dataIndex: 'status',
                            filters: [
                                {
                                    text: 'Действует',
                                    value: 'Действует',
                                },
                                {
                                    text: 'Отключена',
                                    value: 'Отключена',
                                },
                            ],
                            defaultFilteredValue: ['Действует'],
                            onFilter: (value, record) => record.status.startsWith(value),
                        },
                        {
                            title: 'Дата',
                            dataIndex: 'date'
                        },
                        {
                            title: 'Адреса',
                            dataIndex: 'addresses'
                        },
                    ]}
                    dataSource={servicesData}
                    scroll={{
                        x: 900
                    }}
                />
            )
        })();
    }, [data.companyIds]);

    if (isGettingData) {
        return <></>
    }

    return (
        <>
            <Modal open={isServiceOpen} onCancel={hideService} footer={null} width={isMobile ? '95%' : '80%'}>
                {serviceItems}
            </Modal>
            {!isGettingData ? <Typography.Title level={3}>Услуги</Typography.Title> : null}
            {serviceTable}
        </>
    )
}