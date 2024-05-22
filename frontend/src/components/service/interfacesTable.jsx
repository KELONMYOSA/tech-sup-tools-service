import {Form, Button, Card, Table, Select, notification, Popconfirm} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import axios from "axios";

const InterfacesTable = ({service, userData}) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const [api, contextHolder] = notification.useNotification();
    const interfacesRef = useRef(null);
    const [interfaces, setInterfaces] = useState(null);
    const [rowsCount, setRowsCount] = useState(service.interfaces.length);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [form] = Form.useForm();
    const [allFieldsState, setAllFieldsState] = useState(null);
    const [addressChoices, setAddressChoices] = useState(null);
    const [domainChoices, setDomainChoices] = useState(null);
    const [domain2Ip, setDomain2Ip] = useState(null);
    const [portChoices, setPortChoices] = useState(null);
    const [currIP, setCurrIP] = useState(null);

    const showSuccess = (msg) => {
        api.success({
            message: msg,
            placement: 'topRight'
        })
    }

    const showAlert = (msg) => {
        api.error({
            message: msg,
            placement: 'topRight'
        })
    }

    const EditableCell = ({
                              editing,
                              dataIndex,
                              children,
                              ...restProps
                          }) => {
        const index2Item = {
            'portType': <Select options={[{label: 'L2', value: 'L2'}, {label: 'L3', value: 'L3'}]}/>,
            'unitAddress': <Select
                showSearch
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={addressChoices} disabled={!addressChoices}
            />,
            'equipmentDomain': <Select
                showSearch
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={domainChoices} disabled={!domainChoices}/>,
            'portHost': <p>{currIP}</p>,
            'iName': <Select
                showSearch
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={portChoices} disabled={!portChoices}/>,
            'action': null,
        }
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{
                            margin: 0,
                        }}
                        rules={[
                            {
                                required: true,
                                message: 'Обязательное поле!',
                            },
                        ]}
                    >
                        {index2Item[dataIndex]}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };

    const onFieldsChange = (changedFields, allFields) => {
        if (allFields === allFieldsState) {
            return
        }

        if (changedFields[0].validated && changedFields[0].name[0] === 'unitAddress') {
            (async () => {
                try {
                    const response = await axios.get(`${apiUrl}/interface/choices/equipment?unit_id=${changedFields[0].value}`)
                    const respData = response.data
                    setDomainChoices(respData.map(e => ({label: e.domain, value: e.id})))
                    const d2ip = {}
                    respData.forEach((e, _) => d2ip[e.id] = e.ip);
                    setDomain2Ip(d2ip)
                    form.setFieldValue('equipmentDomain', null)
                    form.setFieldValue('portHost', null)
                    setCurrIP(null)
                    form.setFieldValue('iName', null)
                } catch (error) {
                    console.error(error)
                }
            })()
            setAllFieldsState(allFields)
        }

        if (changedFields[0].validated && changedFields[0].name[0] === 'equipmentDomain') {
            (async () => {
                try {
                    const ipVal = domain2Ip[changedFields[0].value]
                    const response = await axios.get(`${apiUrl}/interface/choices/port?ip=${ipVal}`)
                    setPortChoices(response.data.map(e => ({label: e.name, value: e.id})))
                    setCurrIP(ipVal)
                    form.setFieldValue('portHost', ipVal)
                    form.setFieldValue('iName', null)
                } catch (error) {
                    console.error(error)
                }
            })()
            setAllFieldsState(allFields)
        }
    }

    const toggleAdd = (record) => {
        if (isAddingNew) {
            setIsAddingNew(!isAddingNew);
            interfacesRef.current = interfacesRef.current.splice(-1)
            interfacesRef.current = [...interfacesRef.current, {key: 'addButton'}]
            setInterfaces(interfacesRef.current)
            setRowsCount(rowsCount - 1)
        } else {
            if (addressChoices === null) {
                (async () => {
                    try {
                        const response = await axios.get(`${apiUrl}/interface/choices/address`)
                        setAddressChoices(response.data.map(a => ({label: a.address, value: a.id})))
                    } catch (error) {
                        console.error(error)
                    }
                })()
            }
            setIsAddingNew(!isAddingNew);
            record.key = rowsCount
            setRowsCount(rowsCount + 1)
            form.setFieldsValue({
                portType: '',
                unitAddress: '',
                equipmentDomain: '',
                portHost: '',
                iName: '',
                action: ' ',
                ...record,
            });
        }
    };

    const saveInterface = async () => {
        try {
            const formResults = await form.validateFields()

            const body = {
                id_service: service.id,
                id_unit: formResults.unitAddress,
                id_equip: formResults.equipmentDomain,
                id_port: formResults.iName,
                port_type: formResults.portType,
            }
            try {
                const response = await axios.post(
                    `${apiUrl}/interface/`,
                    body
                );

                setIsAddingNew(!isAddingNew);
                const newInterfaces = interfacesRef.current
                const newInf = {}
                Object.entries(formResults).forEach(([k, v]) => {
                    if (k === 'unitAddress') {
                        addressChoices.forEach((a, _) => {
                            if (a.value === v) {
                                newInf['unitAddress'] = a.label
                            }
                        });
                    } else if (k === 'equipmentDomain') {
                        domainChoices.forEach((e, _) => {
                            if (e.value === v) {
                                newInf['equipmentDomain'] = e.label
                            }
                        });
                    } else if (k === 'iName') {
                        let selectedDomain
                        domainChoices.forEach((e, _) => {
                            if (e.value === formResults.equipmentDomain) {
                                selectedDomain = e.label
                            }
                        });
                        portChoices.forEach((p, _) => {
                            if (p.value === v) {
                                newInf['iName'] = <a target='_blank'
                                                     href={`${apiUrl}/zabbix/traffic?host=${selectedDomain}&interface=${p.label}`}>{p.label}</a>
                            }
                        });
                    } else if (k === 'portHost') {
                        newInf['portHost'] = <a target='_blank'
                                                href={`https://zbxweb.comfortel.pro/zabbix.php?action=search&search=${v}`}>{v}</a>
                    } else if (k === 'action') {
                        newInf['action'] = (
                            <Popconfirm
                                title="Удалить данный интерфейс?"
                                okText="Удалить"
                                cancelText="Отмена"
                                onConfirm={() => removeInterface(newInterfaces[newInterfaces.length - 1].key)}
                            >
                                <Button size='small' type={'text'}>
                                    <DeleteOutlined/>
                                </Button>
                            </Popconfirm>)
                    } else {
                        newInf[k] = v
                    }
                })
                newInterfaces[newInterfaces.length - 1] = {...newInterfaces[newInterfaces.length - 1], ...newInf}
                interfacesRef.current = [...newInterfaces, {key: 'addButton'}]
                setInterfaces(interfacesRef.current)
                showSuccess("Интерфейс создан!")
            } catch (error) {
                showAlert("Ошибка создания интерфейса!")
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }

    }

    const removeInterface = async (key) => {
        const delInf = interfacesRef.current.filter((interfaceObj) => interfaceObj.key === key)[0]
        const body = {
            id_service: service.id,
            equip: delInf.equipmentDomain,
            port: delInf.iName.props.children,
            port_type: delInf.portType,
        }
        try {
            const response = await axios.delete(
                `${apiUrl}/interface/`,
                {data: body}
            );
            const updatedInterfaces = interfacesRef.current.filter((interfaceObj) => interfaceObj.key !== key)
            interfacesRef.current = updatedInterfaces
            setInterfaces(updatedInterfaces)
            showSuccess("Интерфейс удален!")
        } catch (error) {
            showAlert("Ошибка удаления интерфейса!")
        }
    }

    const sharedOnCell = (record, dataIndex) => {
        if (record.key === 'addButton') {
            return {
                colSpan: 0,
            };
        } else {
            return {
                editing: isAddingNew && record.key === rowsCount - 1,
                dataIndex: dataIndex,
            };
        }
    };

    useEffect(() => {
        const initInterfaces = (
            service.interfaces.map((i, n) => (
                {
                    key: n,
                    portType: i.type,
                    unitAddress: i.uAddress ? `${i.uAddress.city}${!['', ' ', null].includes(i.uAddress.street) ? `, ${i.uAddress.street}` : ''}${!['', ' ', null].includes(i.uAddress.house) ? `, ${i.uAddress.house}` : ''}${!['', ' ', null].includes(i.uAddress.building) ? `, ${i.uAddress.building}` : ''}${!['', ' ', null].includes(i.uAddress.letter) ? ` ${i.uAddress.letter}` : ''}${!['', ' ', null].includes(i.uAddress.flat) ? `, ${i.uAddress.flat}` : ''}` : null,
                    equipmentDomain: i.eDomain,
                    portHost: <a target='_blank'
                                 href={`https://zbxweb.comfortel.pro/zabbix.php?action=search&search=${i.host}`}>{i.host}</a>,
                    iName: <a target='_blank'
                              href={`${apiUrl}/zabbix/traffic?host=${i.eDomain}&interface=${i.name}`}>{i.name}</a>,
                    action: (
                        <Popconfirm
                            title="Удалить данный интерфейс?"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={() => removeInterface(n)}
                        >
                            <Button size='small' type={'text'}>
                                <DeleteOutlined/>
                            </Button>
                        </Popconfirm>
                    )
                }
            ))
        )
        if ([10001, 10025].indexOf(userData.gidNumber) !== -1) {
            initInterfaces.push({
                key: 'addButton'
            })
        }
        interfacesRef.current = initInterfaces
        setInterfaces(interfacesRef.current)
    }, []);

    if ([10001, 10025].indexOf(userData.gidNumber) === -1) {
        if (service.interfaces.length === 0) {
            return null
        }

        return (
            <Card title='Интерфейсы' size='small'>
                <Table
                    pagination={false}
                    size='small'
                    scroll={{
                        x: 500
                    }}
                    dataSource={interfaces}
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
    } else {
        if (service.interfaces.length === 0 && [297, 303].indexOf(service.typeId) === -1) {
            return null
        }

        return (
            <Card title='Интерфейсы' size='small'>
                {contextHolder}
                <Form form={form} component={false} onFieldsChange={onFieldsChange}>
                    <Table
                        pagination={false}
                        size='small'
                        scroll={{
                            x: 500
                        }}
                        summary={() => {
                            return (
                                isAddingNew ?
                                    <Table.Summary fixed>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell colSpan={5} index={0}>
                                                <>
                                                    <Button size='small' style={{marginRight: 8}} onClick={toggleAdd}>
                                                        Отмена
                                                    </Button>
                                                    <Button type='primary' size='small' onClick={saveInterface}>
                                                        Сохранить
                                                    </Button>
                                                </>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </Table.Summary>
                                    :
                                    null
                            )
                        }}
                        dataSource={interfaces}
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        columns={[
                            {
                                title: 'Тип',
                                dataIndex: 'portType',
                                onCell: (record, _) => ({
                                    colSpan: record.key === 'addButton' ? 6 : 1,
                                    editing: isAddingNew && record.key === rowsCount - 1,
                                    dataIndex: 'portType',
                                }),
                                render: (content, record) => {
                                    if (record.key !== 'addButton') {
                                        return content
                                    }
                                    return isAddingNew ? (
                                        content
                                    ) : (
                                        <Button size={'small'} type={'text'} style={{width: '100%'}}
                                                onClick={() => toggleAdd(record)}>
                                            <PlusOutlined/>
                                        </Button>
                                    )
                                },
                            },
                            {
                                title: 'Адрес узла',
                                dataIndex: 'unitAddress',
                                onCell: (record, _) => sharedOnCell(record, 'unitAddress'),
                            },
                            {
                                title: 'Оборудование',
                                dataIndex: 'equipmentDomain',
                                onCell: (record, _) => sharedOnCell(record, 'equipmentDomain'),
                            },
                            {
                                title: 'IP',
                                dataIndex: 'portHost',
                                onCell: (record, _) => sharedOnCell(record, 'portHost'),
                            },
                            {
                                title: 'Интерфейс',
                                dataIndex: 'iName',
                                onCell: (record, _) => sharedOnCell(record, 'iName'),
                            },
                            {
                                dataIndex: 'action',
                                onCell: (record, _) => sharedOnCell(record, 'action'),
                            },
                        ]}
                    />
                </Form>
            </Card>
        );
    }
};

export default InterfacesTable;
