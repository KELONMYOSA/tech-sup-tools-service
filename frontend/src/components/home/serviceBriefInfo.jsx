import {Col, Descriptions, List, Row, Table} from "antd";
import React from "react";
import axios from "axios";
import styles from '../../index.module.less'

export default async function ServiceBriefInfo(data) {
    const apiUrl = import.meta.env.VITE_API_URL
    const serviceId = data.serviceId

    const getServiceInfo = async (serviceId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/search/service/${serviceId}`
            );

            return response.data
        } catch (error) {
            console.error(error)
            return null
        }
    };

    const service = await getServiceInfo(serviceId)
    if (!service) {
        return [false, null]
    }

    let interfacesTable
    if (service.interfaces.length > 0) {
        interfacesTable = (
            <Col flex='1 1'>
                <div style={{marginLeft: -40, marginBottom: 10, marginTop: 10}}>
                    <Table
                        pagination={false}
                        size='small'
                        className={styles.small_font_table}
                        bordered
                        dataSource={
                            service.interfaces.map((i, n) => (
                                {
                                    key: n,
                                    portType: i.type,
                                    unitAddress: `${i.uAddress.city}${!['', ' ', null].includes(i.uAddress.street) ? `, ${i.uAddress.street}` : ''}${!['', ' ', null].includes(i.uAddress.house) ? `, ${i.uAddress.house}` : ''}${!['', ' ', null].includes(i.uAddress.building) ? `, ${i.uAddress.building}` : ''}${!['', ' ', null].includes(i.uAddress.letter) ? ` ${i.uAddress.letter}` : ''}${!['', ' ', null].includes(i.uAddress.flat) ? `, ${i.uAddress.flat}` : ''}`,
                                    equipmentDomain: i.eDomain,
                                    portHost: i.host,
                                    iName: i.name,
                                }
                            ))}
                        columns={[
                            {
                                title: 'Тип',
                                dataIndex: 'portType',
                            },
                            {
                                title: 'Адрес узла',
                                dataIndex: 'unitAddress',
                            },
                            {
                                title: 'Оборудование',
                                dataIndex: 'equipmentDomain',
                            },
                            {
                                title: 'IP',
                                dataIndex: 'portHost',
                            },
                            {
                                title: 'Интерфейс',
                                dataIndex: 'iName',
                            },
                        ]}
                    />
                </div>
            </Col>
        )
    }

    let ipList
    if (service.subnets.length > 0) {
        ipList = (
            <Col flex='1 1'>
                <div style={interfacesTable === undefined ? {marginBottom: 10} : {marginLeft: 30, marginBottom: 10}}>
                    <List
                        size='small'
                        header={<b>IP</b>}
                        bordered
                        className={styles.small_font_list}
                        dataSource={service.subnets}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                    />
                </div>
            </Col>
        )
    }

    let telData
    if (service.typeId === 370) {
        telData = (
            <>
                <Descriptions
                    size='small'
                    style={{marginTop: 10}}
                    className={styles.small_font_descriptions}
                    items={[
                        {
                            label: 'Тип подключения',
                            children: service.phoneVats.atsType
                        },
                        {
                            label: 'Городских линий',
                            children: service.phoneVats.cityLine
                        },
                        {
                            label: 'Внутренних линий',
                            children: service.phoneVats.innerLine
                        },
                    ]}
                />
                <Table
                    pagination={false}
                    className={styles.small_font_table}
                    size='small'
                    scroll={{
                        x: 500
                    }}
                    dataSource={
                        service.phoneLines.map((p, i) => (
                            {
                                key: i,
                                targetIn: p.targetIn === 'Y' ? 'Да' : 'Нет',
                                targetOut: p.targetOut === 'Y' ? 'Да' : 'Нет',
                                phone: p.phone,
                                typeMobile: p.typeMobile === 'Y' ? 'Да' : 'Нет',
                                typeMgMn: p.typeMgMn === 'Y' ? 'Да' : 'Нет',
                                typeSpb: p.typeSpb === 'Y' ? 'Да' : 'Нет',
                                comm: p.comm,
                            }
                        ))}
                    columns={[
                        {
                            title: 'Вх.',
                            dataIndex: 'targetIn',
                        },
                        {
                            title: 'Исх.',
                            dataIndex: 'targetOut',
                        },
                        {
                            title: '',
                            dataIndex: 'phone',
                        },
                        {
                            title: 'Моб.',
                            dataIndex: 'typeMobile',
                        },
                        {
                            title: 'МГ/МН',
                            dataIndex: 'typeMgMn',
                        },
                        {
                            title: 'СПб',
                            dataIndex: 'typeSpb',
                        },
                        {
                            title: 'Комментарии',
                            dataIndex: 'comm',
                        },
                    ]}
                />
            </>
        )
    }

    return (
        [true,
            <Row style={{width: '100%'}}>
                <Col style={{width: '100%'}}>
                    <Descriptions
                        size='small'
                        column={4}
                        className={styles.small_font_descriptions}
                        style={{marginTop: 10}}
                        items={[
                            {
                                label: 'Скорость',
                                children: service.speed === 0 ? '- ? -' : service.speed,
                            },
                            {
                                label: 'Vlan(s)',
                                children: (
                                    service.vlans.map((vlan, i) => (
                                        <a key={i} target='_blank'
                                           href={`http://10.3.1.8:13080/viz/${vlan.vlan}`}>{vlan.vlan} </a>
                                    ))
                                ),
                            },
                            {
                                label: 'Сервисные документы',
                                span: {xs: 2},
                                children: (
                                    <ul style={{listStyle: "none"}}>
                                        {service.serviceDocs.map((doc, i) => (
                                            <li key={i}>
                                                <a target='_blank'
                                                   href={`https://boss.comfortel.pro/service_docs/${serviceId}/${doc}`}>
                                                    {doc}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ),
                            },
                        ]}
                    />
                    <Row style={{width: '100%'}}>
                        {interfacesTable}
                        {ipList}
                    </Row>
                    {telData}
                </Col>
            </Row>
        ]
    )
}
