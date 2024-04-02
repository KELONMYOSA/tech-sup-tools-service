import {Button, Card, Col, Descriptions, List, Row, Table, Tabs, Typography} from "antd";
import React from "react";
import axios from "axios";
import {Document, Page, pdfjs} from "react-pdf";
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import CopyToClipboardButton from "../../utils/components.jsx";

export default async function ServiceInfo(data) {
    const apiUrl = import.meta.env.VITE_API_URL
    const jiraUrl = import.meta.env.VITE_JIRA_URL
    const serviceId = data.serviceId

    const getServiceInfo = async (serviceId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/service/${serviceId}`
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

    const getJiraIssues = async (serviceId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/jira/${serviceId}`
            );

            return response.data
        } catch (error) {
            return []
        }
    };

    const jira = await getJiraIssues(serviceId)

    const jiraOpen = jira.filter((issue) => issue.status !== 'Решено')
    let jiraOpenIssues
    if (jiraOpen.length > 0) {
        jiraOpenIssues = (
            <Card title="Открытые заявки" size='small' style={{marginBottom: 10}}>
                <ul style={{marginLeft: 10, listStyle: 'none'}}>
                    {jiraOpen.map((issue, i) => (
                        <li key={i}>
                            <a target='_blank'
                               href={`${jiraUrl}/browse/${issue.key}`}>{`[${issue.key}] ${issue.summary} (${issue.status})`}</a>
                        </li>
                    ))}
                </ul>
            </Card>
        )
    }


    let rentServices
    if (service.rentServices.length > 0) {
        rentServices = (
            <Card title='Арендованные услуги:' size='small'>
                <Table
                    pagination={false}
                    size='small'
                    scroll={{
                        x: 500
                    }}
                    dataSource={
                        service.rentServices.map((s, i) => (
                            {
                                key: i,
                                id: <a href={`/service/${s.id}`}>{s.id}</a>,
                                type: s.type.name,
                                company: `(ID: ${s.companyId}) ${s.companyName}`,
                                status: s.status.name,
                            }
                        ))}
                    columns={[
                        {
                            title: 'ID Услуги',
                            dataIndex: 'id',
                        },
                        {
                            title: 'Название',
                            dataIndex: 'type',
                        },
                        {
                            title: 'Компания',
                            dataIndex: 'company',
                        },
                        {
                            title: 'Статус',
                            dataIndex: 'status',
                        },
                    ]}
                />
            </Card>
        )
    }

    let rentedFor
    if (service.rentedFor.length > 0) {
        rentedFor = (
            <Card title='Арендована для:' size='small'>
                <Table
                    pagination={false}
                    size='small'
                    scroll={{
                        x: 500
                    }}
                    dataSource={
                        service.rentedFor.map((s, i) => (
                            {
                                key: i,
                                id: <a href={`/service/${s.id}`}>{s.id}</a>,
                                type: s.type.name,
                                company: `(ID: ${s.companyId}) ${s.companyName}`,
                                status: s.status.name,
                            }
                        ))}
                    columns={[
                        {
                            title: 'ID Услуги',
                            dataIndex: 'id',
                        },
                        {
                            title: 'Название',
                            dataIndex: 'type',
                        },
                        {
                            title: 'Компания',
                            dataIndex: 'company',
                        },
                        {
                            title: 'Статус',
                            dataIndex: 'status',
                        },
                    ]}
                />
            </Card>
        )
    }

    let pack
    if (service.pack.length > 0) {
        pack = (
            <Card title='Входит в пакет:' size='small'>
                <Table
                    pagination={false}
                    size='small'
                    scroll={{
                        x: 500
                    }}
                    dataSource={
                        service.pack.map((p, i) => (
                            {
                                key: i,
                                id: <a href={`/service/${p.id}`}>{p.id}</a>,
                                type: p.type.name,
                                status: p.status.name,
                            }
                        ))}
                    columns={[
                        {
                            title: 'ID Услуги',
                            dataIndex: 'id',
                        },
                        {
                            title: 'Название',
                            dataIndex: 'type',
                        },
                        {
                            title: 'Статус',
                            dataIndex: 'status',
                        },
                    ]}
                />
            </Card>
        )
    }

    let interfacesTable
    if (service.interfaces.length > 0) {
        interfacesTable = (
            <Card title='Интерфейсы' size='small'>
                <Table
                    pagination={false}
                    size='small'
                    scroll={{
                        x: 500
                    }}
                    dataSource={
                        service.interfaces.map((i, n) => (
                            {
                                key: n,
                                portType: i.type,
                                unitAddress: i.uAddress ? `${i.uAddress.city}${!['', ' ', null].includes(i.uAddress.street) ? `, ${i.uAddress.street}` : ''}${!['', ' ', null].includes(i.uAddress.house) ? `, ${i.uAddress.house}` : ''}${!['', ' ', null].includes(i.uAddress.building) ? `, ${i.uAddress.building}` : ''}${!['', ' ', null].includes(i.uAddress.letter) ? ` ${i.uAddress.letter}` : ''}${!['', ' ', null].includes(i.uAddress.flat) ? `, ${i.uAddress.flat}` : ''}` : null,
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
            </Card>
        )
    }

    let ipList
    if (service.subnets.length > 0) {
        ipList = (
            <Card title='IP' size='small'>
                <List
                    size="small"
                    dataSource={service.subnets}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                />
            </Card>
        )
    }

    let telData
    if (service.typeId === 370) {
        telData = (
            <Card title='Телефония' size='small'>
                <>
                    <Descriptions
                        size='small'
                        style={{marginTop: 10}}
                        column={1}
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
            </Card>
        )
    }

    let packData
    if (service.typeId === 4534) {
        packData = (
            <Card title='Услуги, входящие в пакет' size='small'>
                <Table
                    pagination={false}
                    size='small'
                    scroll={{
                        x: 500
                    }}
                    dataSource={
                        service.packServices.map((p, i) => (
                            {
                                key: i,
                                id: <a href={`/service/${p.id}`}>{p.id}</a>,
                                type: p.type.name,
                                status: p.status.name,
                                aes: (
                                    <a href={`https://boss.comfortel.pro/index.phtml?service_id=${p.id}&url_fav=1&mid=154&pid=404&module_mode=open&company_id=${p.companyId}&oid=1163`}>AES</a>),
                            }
                        ))}
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'id',
                        },
                        {
                            title: 'Тип услуги',
                            dataIndex: 'type',
                        },
                        {
                            title: 'Статус',
                            dataIndex: 'status',
                        },
                        {
                            title: '',
                            dataIndex: 'aes',
                        },
                    ]}
                />
            </Card>
        )
    }

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url,
    ).toString();

    let serviceDocs
    if (service.serviceDocs.length > 0) {
        serviceDocs = (
            <Card title='Схема' size='small'>
                {
                    service.serviceDocs.map((doc, i) => {
                        if (doc.indexOf(".pdf", doc.length - 4) !== -1) {
                            return (
                                <Document key={i} file={`${apiUrl}/service_docs/${serviceId}/${doc}`}>
                                    <Page width={data.pdfWidth} pageNumber={1}/>
                                </Document>
                            )
                        }
                    })
                }
            </Card>
        )
    }

    return (
        [true, service,
            <Row key={1}>
                <Col key={1} xs={24} md={10} lg={7} style={{padding: 20}}>
                    <Card key={1}
                          title={
                              <CopyToClipboardButton
                                  text={serviceId}
                                  type='text'
                                  style={{padding: 0}}
                                  item={
                                      <Typography.Title style={{marginTop: 8}} level={3}>
                                          {`Услуга ID: ${serviceId}`}
                                      </Typography.Title>
                                  }
                              />
                          }
                    >
                        <Descriptions
                            title="Общие сведения"
                            size='small'
                            column={1}
                            items={[
                                {
                                    label: 'Компания',
                                    children: (<a href={`/company/${service.companyId}`}>
                                        (ID: {service.companyId}) {service.company} ({service.companyTypeDesc.name})
                                    </a>),
                                },
                                {
                                    label: 'Провайдер',
                                    children: `(ID: ${service.provider.id}) ${service.provider.name}`,
                                },
                                {
                                    label: 'Торговая марка',
                                    children: service.companyBrandName || '-',
                                },
                                {
                                    label: 'Услуга',
                                    children: (<a target="_blank"
                                                  href={`https://boss.comfortel.pro/index.phtml?service_id=${service.id}&url_fav=1&mid=154&pid=404&module_mode=open&company_id=${service.companyId}&oid=1163`}>
                                        (ID: {service.id}) {service.type}
                                    </a>),
                                },
                                {
                                    label: 'Договор',
                                    children: service.document || '???',
                                },
                                {
                                    label: 'Направление',
                                    children: service.isProvider ? 'Покупка' : 'Продажа',
                                },
                                {
                                    label: 'Статус',
                                    children: service.statusString,
                                    contentStyle: service.status.id === 727 ? {color: 'green'} : {color: 'red'}
                                },
                                {
                                    label: 'Менеджер',
                                    children: service.manager ? `${service.manager.lname || ''} ${service.manager.fname || ''} ${service.manager.mname || ''}` : '-',
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
                                    children: service.managerService ? `${service.managerService.lname || ''} ${service.managerService.fname || ''} ${service.managerService.mname || ''}` : '-',
                                },
                            ]}
                        />
                    </Card>
                    <Card key={2} title="Адреса" style={{marginTop: 20}}>
                        <ul style={{marginLeft: 10}}>
                            {service.addresses.map((address, i) => (
                                <li key={i}>{
                                    `${address.city}${!['', ' '].includes(address.street) ? `, ${address.street}` : ''}${!['', ' '].includes(address.house) ? `, ${address.house}` : ''}${!['', ' '].includes(address.building) ? `, ${address.building}` : ''}${!['', ' '].includes(address.letter) ? ` ${address.letter}` : ''}${!['', ' '].includes(address.flat) ? `, кв. ${address.flat}` : ''}`
                                }</li>
                            ))}
                        </ul>
                    </Card>
                    <Card key={3} title="Примечания" style={{marginTop: 20}}>
                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: '1',
                                    label: 'Менеджерское',
                                    children: (
                                        <pre style={{overflowX: 'scroll', paddingBottom: 10}}>
                                                {service.description || '---'}
                                            </pre>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: 'Техническое',
                                    children: (
                                        <pre style={{overflowX: 'scroll', paddingBottom: 10}}>
                                                {service.supportDescription || '---'}
                                            </pre>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                    <Card key={4} title="Jira" style={{marginTop: 20}}
                          extra={<Button onClick={data.showIssueCreation}>Создать задачу</Button>}>
                        <ul style={{marginLeft: 10}}>
                            {jira.map((issue, i) => (
                                <li key={i}>
                                    <a target='_blank'
                                       href={`${jiraUrl}/browse/${issue.key}`}>{`[${issue.key}] ${issue.summary} (${issue.status})`}</a>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Col>
                <Col key={2} xs={24} md={14} lg={17} style={{padding: 20}}>
                    <Card title="Технические параметры">
                        {jiraOpenIssues}
                        {rentServices}
                        {rentedFor}
                        {pack}
                        {packData}
                        <Descriptions
                            size='small'
                            bordered
                            style={{marginTop: 10, marginBottom: 10}}
                            items={[
                                {
                                    label: 'Скорость',
                                    children: service.speed === 0 ? '- ? -' : service.speed,
                                },
                                {
                                    label: 'Vlan(s)',
                                    children: (
                                        <ul style={{listStyle: "none"}}>
                                            {service.vlans.map((vlan, i) => (
                                                <li key={i}>
                                                    <a target='_blank'
                                                       href={`http://10.3.1.8:13080/viz/${vlan.vlan}`}>{vlan.vlan} </a>
                                                </li>
                                            ))}
                                        </ul>
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
                        {interfacesTable}
                        {ipList}
                        {telData}
                        {serviceDocs}
                    </Card>
                </Col>
            </Row>
        ]
    )
}
