import {Button, Input, Space, Table, Tooltip} from "antd";
import React, {useEffect, useRef, useState} from "react";
import ServiceBriefInfo from "../home/serviceBriefInfo.jsx";
import {SearchOutlined} from "@ant-design/icons";
import styles from '../../index.module.less'
import axios from "axios";

export default function CompanyServicesTable(data) {
    const apiUrl = import.meta.env.VITE_API_URL
    const [isGettingData, setIsGettingData] = useState(true);
    const [serviceTable, setServiceTable] = useState(null);
    const [expandedData, setExpandedData] = useState({});
    const searchInput = useRef(null);

    const getServices = async () => {
        try {
            const response = await axios.get(
                `${apiUrl}/service/byCompany/${data.companyId}`
            );
            setIsGettingData(false)
            return response.data
        } catch (error) {
        }
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

            const typeFilters = ([...new Set(services.map(s => s.type))].map(t => ({
                text: t,
                value: t,
            })))

            const statusFilters = ([...new Set(services.map(s => s.status.name))].map(t => ({
                text: t,
                value: t,
            })))

            const servicesData = services.map(service => ({
                key: service.id,
                id: (
                    <Tooltip title='Подробнее'>
                        <a type='text' href={`/service/${service.id}`}>{service.id}</a>
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
    }, [data.servicesData, expandedData]);

    if (isGettingData) {
        return <></>
    }

    return serviceTable
}
