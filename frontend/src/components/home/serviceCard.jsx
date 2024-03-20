import {Button, Input, Space, Table, Tooltip, Typography} from "antd";
import React, {useEffect, useRef, useState} from "react";
import ServiceBriefInfo from "./serviceBriefInfo.jsx";
import {SearchOutlined} from "@ant-design/icons";
import styles from '../../index.module.less'

export default function ServiceCard(data) {
    const [isGettingData, setIsGettingData] = useState(true);
    const [serviceTable, setServiceTable] = useState(null);
    const [expandedData, setExpandedData] = useState({});
    const [serviceStatuses, setServiceStatuses] = useState(null);
    const searchInput = useRef(null);

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
            if (data.servicesData === null) {
                setIsGettingData(true)
                if (Object.keys(expandedData).length !== 0) {
                    setExpandedData({})
                }
                return
            } else {
                setIsGettingData(false)
            }

            const typeFilters = data.servicesData.stats.service_types.map(t => ({
                text: t,
                value: t,
            }))

            const statusFilters = []
            for (const [key, value] of Object.entries(data.servicesData.stats.service_statuses)) {
                statusFilters.push(
                    {
                        text: key,
                        value: key,
                    }
                )
            }

            const companyFilters = []
            for (const [key, value] of Object.entries(data.servicesData.stats.company_id2name)) {
                companyFilters.push(
                    {
                        text: `(ID: ${key}) ${value}`,
                        value: `(ID: ${key}) ${value}`,
                    }
                )
            }

            let statuses = Object.keys(data.servicesData.stats.service_statuses).map(function(key) {
                return [key, data.servicesData.stats.service_statuses[key]];
            });
            statuses.sort(function(first, second) {
                return second[1] - first[1];
            });
            statuses = statuses.map(s => `${s[0]}: ${s[1]}`)
            setServiceStatuses(statuses.join(', '))

            const servicesData = data.servicesData.data.map(service => ({
                key: service.service_id,
                id: (
                    <Tooltip title='Подробнее'>
                        <Button type='link' href={`/service/${service.service_id}`}
                                target='_blank'>{service.service_id}</Button>
                    </Tooltip>
                ),
                company: (
                    <Tooltip title='Подробнее'>
                        <a type='text' href={`/company/${service.company_id}`}
                                target='_blank'>{`(ID: ${service.company_id}) ${service.company_name}`}</a>
                    </Tooltip>
                ),
                type: service.service_type,
                status: service.service_status,
                addresses: (
                    <ul>
                        {service.service_address.map((address, i) => (
                            <li key={i}>{
                                address
                            }</li>
                        ))}
                    </ul>),
                manageComm: (
                    <Tooltip placement="topLeft" title={service.service_description}>
                        {service.service_description}
                    </Tooltip>),
                techComm: (
                    <Tooltip placement="topLeft" title={service.service_support_description}>
                        {service.service_support_description}
                    </Tooltip>),
            }))

            setServiceTable(
                <Table
                    className={styles.contrast_collapse_background}
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'id',
                            sorter: (a, b) => a.key - b.key,
                        },
                        {
                            title: 'Компания',
                            dataIndex: 'company',
                            filters: companyFilters,
                            onFilter: (value, record) => JSON.stringify(record.company).indexOf(value) >= 0,
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

    return (
        <>
            {!isGettingData ? <Typography.Title
                level={3}>{serviceStatuses}</Typography.Title> : null}
            {serviceTable}
        </>
    )
}