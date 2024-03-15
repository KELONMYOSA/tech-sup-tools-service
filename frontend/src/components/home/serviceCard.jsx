import {Button, Input, Space, Table, Tooltip, Typography} from "antd";
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import ServiceBriefInfo from "./serviceBriefInfo.jsx";
import {SearchOutlined} from "@ant-design/icons";
import styles from '../../index.module.less'

export default function ServiceCard(data) {
    const apiUrl = import.meta.env.VITE_API_URL

    const [isGettingData, setIsGettingData] = useState(true);
    const [serviceTable, setServiceTable] = useState(null);
    const [countServicesActive, setCountServicesActive] = useState(0);
    const [countServicesDisabled, setCountServicesDisabled] = useState(0);
    const [expandedData, setExpandedData] = useState({});
    const searchInput = useRef(null);

    const getServices = async () => {
        let services = []
        if (data.serviceId === null) {
            for (const i in data.companyIds) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/service/brief?company_id=${data.companyIds[i]}`
                    );
                    services.push(response.data)
                } catch (error) {
                    console.error(error)
                }
            }
        } else {
            try {
                const response = await axios.get(
                    `${apiUrl}/service/brief?id=${data.serviceId}`
                );
                services.push(response.data)
            } catch (error) {
                console.error(error)
            }
        }
        setIsGettingData(false)
        return services
    };

    const handleExpand = async (expanded, record) => {
        if (expanded) {
            const briefInfo = await ServiceBriefInfo({serviceId: record.key});
            setExpandedData(prevExpandedData => ({
                ...prevExpandedData,
                [record.key]: briefInfo[1]
            }));
        }
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
    };

    const handleReset = (clearFilters) => {
        clearFilters();
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Найти
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Сброс
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            JSON.stringify(record[dataIndex]).toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) => text
    });

    useEffect(() => {
        (async () => {
            const services = await getServices();
            if (services.length === 0) {
                setIsGettingData(true)
                if (Object.keys(expandedData).length !== 0) {
                    setExpandedData({})
                }
                return
            }

            let allServices = []
            let active = 0
            let disabled = 0
            for (const i in services) {
                allServices = allServices.concat(services[i].active)
                allServices = allServices.concat(services[i].disabled)
                active = active + services[i].active.length
                disabled = disabled + services[i].disabled.length
            }

            setCountServicesActive(active)
            setCountServicesDisabled(disabled)

            const typeFilters = ([...new Set(allServices.map(s => s.type))].map(t => ({
                text: t,
                value: t,
            })))

            const statusFilters = ([...new Set(allServices.map(s => s.status.name))].map(t => ({
                text: t,
                value: t,
            })))

            const servicesData = allServices.map(service => ({
                key: service.id,
                id: (
                    <Tooltip title={`(ID: ${service.companyId}) ${service.company}`}>
                        <Button type='text' href={`/service/${service.id}`} target='_blank'>{service.id}</Button>
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
                    </ul>),
                manageComm: (
                    <Tooltip placement="topLeft" title={service.description}>
                        {service.description}
                    </Tooltip>),
                techComm: (
                    <Tooltip placement="topLeft" title={service.supportDescription}>
                        {service.supportDescription}
                    </Tooltip>),
            }))

            setServiceTable(
                <Table
                    className={styles.contrast_collapse_background}
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'id',
                            defaultSortOrder: 'descend',
                            sorter: (a, b) => a.key - b.key,
                        },
                        {
                            title: 'Тип',
                            dataIndex: 'type',
                            filters: typeFilters,
                            onFilter: (value, record) => record.type.startsWith(value),
                        },
                        {
                            title: 'Статус',
                            dataIndex: 'status',
                            filters: statusFilters,
                            defaultFilteredValue: ['Действует'],
                            onFilter: (value, record) => record.status.startsWith(value),
                        },
                        {
                            title: 'Дата',
                            dataIndex: 'date'
                        },
                        {
                            title: 'Адреса',
                            dataIndex: 'addresses',
                            width: 400,
                            ...getColumnSearchProps('addresses'),
                        },
                        {
                            title: 'Менеджерское',
                            dataIndex: 'manageComm',
                            ellipsis: {
                                showTitle: false,
                            },
                            ...getColumnSearchProps('manageComm'),
                        },
                        {
                            title: 'Техническое',
                            dataIndex: 'techComm',
                            ellipsis: {
                                showTitle: false,
                            },
                            ...getColumnSearchProps('techComm'),
                        },
                    ]}
                    expandable={{
                        expandedRowRender: record => {
                            const data = expandedData[record.key];
                            return data ? (
                                <div>{data}</div>
                            ) : (
                                <div>Загрузка...</div>
                            );
                        },
                        onExpand: handleExpand,
                    }}
                    dataSource={servicesData}
                    size='small'
                    pagination={false}
                    scroll={{
                        x: 1200
                    }}
                />
            )
        })();
    }, [data.companyIds, expandedData]);

    if (isGettingData) {
        return <></>
    }

    return (
        <>
            {!isGettingData ? <Typography.Title
                level={3}>{`Услуги (Действует: ${countServicesActive}, Отключено: ${countServicesDisabled})`}</Typography.Title> : null}
            {serviceTable}
        </>
    )
}