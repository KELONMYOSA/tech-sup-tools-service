import {Button, Col, Input, Row, Space, Table, Tooltip, Typography} from "antd";
import React, {useEffect, useRef, useState} from "react";
import ServiceBriefInfo from "./serviceBriefInfo.jsx";
import {DownOutlined, SearchOutlined, UpOutlined} from "@ant-design/icons";
import styles from '../../index.module.less'
import JiraTicketsModal from "./jiraTicketsModal.jsx";

export default function ServiceCard(data) {
    const [isGettingData, setIsGettingData] = useState(true);
    const [isExpandedComments, setIsExpandedComments] = useState(true);
    const [serviceTable, setServiceTable] = useState(null);
    const [expandedData, setExpandedData] = useState({});
    const [serviceStatuses, setServiceStatuses] = useState(null);
    const [jiraModalIsOpen, setJiraModalIsOpen] = useState(false);
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
            const defaultStatusFilters = []
            for (const [key, value] of Object.entries(data.servicesData.stats.service_statuses)) {
                if (key === 'Действует') {
                    defaultStatusFilters.push('Действует')
                }
                if (key === 'null') {
                    statusFilters.push(
                        {
                            text: null,
                            value: null,
                        }
                    )
                    continue
                }
                statusFilters.push(
                    {
                        text: key,
                        value: key,
                    }
                )
            }

            const brandFilters = data.servicesData.stats.company_brand_names.map(t => ({
                text: t,
                value: t,
            }))

            const companyFilters = []
            for (const [key, value] of Object.entries(data.servicesData.stats.company_id2name)) {
                companyFilters.push(
                    {
                        text: `(ID: ${key}) ${value}`,
                        value: `(ID: ${key}) ${value}`,
                    }
                )
            }

            let statuses = Object.keys(data.servicesData.stats.service_statuses).map(function (key) {
                return [key, data.servicesData.stats.service_statuses[key]];
            });
            statuses.sort(function (first, second) {
                return second[1] - first[1];
            });
            statuses = statuses.map(s => `${s[0]}: ${s[1]}`)
            setServiceStatuses(statuses.join(', '))

            const servicesData = data.servicesData.data.map(service => ({
                key: service.service_id,
                id: (
                    <Tooltip title='Подробнее'>
                        <a type='text' href={`/service/${service.service_id}`}>{service.service_id}</a>
                    </Tooltip>
                ),
                company: (
                    <Tooltip title='Подробнее'>
                        <a type='text'
                           href={`/company/${service.company_id}`}>{`(ID: ${service.company_id}) ${service.company_name}`}</a>
                    </Tooltip>
                ),
                brand: service.company_brand_name,
                type: service.service_type,
                status: service.service_status,
                addresses: (
                    <ul style={{marginLeft: 10}}>
                        {service.service_address.map((address, i) => (
                            <li key={i}>{
                                address
                            }</li>
                        ))}
                    </ul>),
                manageComm: isExpandedComments ? service.service_description
                    : (
                        <Tooltip placement="topLeft" title={service.service_description}>
                            {service.service_description}
                        </Tooltip>
                    ),
                techComm: isExpandedComments ? service.service_support_description
                    : (
                        <Tooltip placement="topLeft" title={service.service_support_description}>
                            {service.service_support_description}
                        </Tooltip>
                    ),
            }))

            setServiceTable(
                <Table
                    className={styles.contrast_collapse_background}
                    sticky={{offsetHeader: data.headerHeight}}
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'id',
                            width: 80,
                            showSorterTooltip: false,
                            sorter: (a, b) => a.key - b.key,
                        },
                        {
                            title: 'Компания',
                            dataIndex: 'company',
                            filters: companyFilters,
                            onFilter: (value, record) => JSON.stringify(record.company).indexOf(value) >= 0,
                            className: styles.column_header_filter_button,
                            filterSearch: true,
                        },
                        {
                            title: 'Торговая марка',
                            dataIndex: 'brand',
                            filters: brandFilters,
                            onFilter: (value, record) => record.brand === value,
                            className: styles.column_header_filter_button,
                            filterSearch: true,
                        },
                        {
                            title: 'Тип',
                            dataIndex: 'type',
                            width: 120,
                            filters: typeFilters,
                            className: styles.column_header_filter_button,
                            onFilter: (value, record) => record.type === value,
                        },
                        {
                            title: 'Статус',
                            dataIndex: 'status',
                            width: 120,
                            filters: statusFilters,
                            defaultFilteredValue: defaultStatusFilters,
                            className: styles.column_header_filter_button,
                            onFilter: (value, record) => record.status === value,
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
                            ellipsis: isExpandedComments ? null : {showTitle: false},
                            ...getColumnSearchProps('manageComm'),
                        },
                        {
                            title: 'Техническое',
                            dataIndex: 'techComm',
                            ellipsis: isExpandedComments ? null : {showTitle: false},
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
    }, [data.servicesData, expandedData, isExpandedComments]);

    if (isGettingData) {
        return <></>
    }

    return (
        <>
            <JiraTicketsModal
                isOpen={jiraModalIsOpen}
                closeModal={() => setJiraModalIsOpen(false)}
                companyIds={data.servicesData ? data.servicesData.stats.company_id2name : null}
            />
            {!isGettingData ?
                <Row justify='space-between' align='middle' style={{paddingBottom: 10}}>
                    <Col>
                        <Typography.Title level={5} style={{textAlign: 'center'}}>{serviceStatuses}</Typography.Title>
                    </Col>
                    <Col>
                        <Button
                            icon={<SearchOutlined />}
                            onClick={() => setJiraModalIsOpen(true)}
                        >
                            Открытые задачи
                        </Button>
                        <Button
                            onClick={() => setIsExpandedComments(!isExpandedComments)}
                            type='text'
                            icon={isExpandedComments ? <UpOutlined/> : <DownOutlined/>}
                        >
                            {isExpandedComments ? 'Свернуть комментарии' : 'Развернуть комментарии'}
                        </Button>
                    </Col>
                </Row>
                : null}
            {serviceTable}
        </>
    )
}
