import {MinusOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Descriptions, InputNumber, notification, Popconfirm, Row, Select} from "antd";
import React, {useEffect, useState} from "react";
import axios from "axios";

const TechInfoTable = ({service, userData}) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const [vlanId, setVlanId] = useState(1);
    const [removeVlanId, setRemoveVlanId] = useState(null);
    const [vlanList, setVlanList] = useState(service.vlans.map(vlan => vlan.vlan));
    const [vlanItem, setVlanItem] = useState(null);
    const [api, contextHolder] = notification.useNotification();

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

    const addVlan = async () => {
        try {
            await axios.post(`${apiUrl}/service/vlan?service_id=${service.id}&vlan_id=${vlanId}`);
            setVlanList([...vlanList, vlanId]);
            setVlanId(1)
            showSuccess("Vlan добавлен!")
        } catch (error) {
            showAlert("Ошибка добавления Vlan!")
        }
    }

    const removeVlan = async () => {
        try {
            await axios.delete(`${apiUrl}/service/vlan?service_id=${service.id}&vlan_id=${removeVlanId}`);
            const updatedVlanList = vlanList.filter((v) => v !== removeVlanId)
            setVlanList(updatedVlanList)
            showSuccess("Vlan был удален!")
        } catch (error) {
            showAlert("Ошибка удаления Vlan!")
        }
    }

    useEffect(() => {
        setVlanItem(
            <ul style={{listStyle: "none"}}>
                {vlanList.map((vlan, i) => (
                    <li key={i}>
                        <a target='_blank'
                           href={`http://10.3.1.8:13080/viz/${vlan}`}>{vlan} </a>
                    </li>
                ))}
            </ul>
        )
    }, [vlanList]);

    return (
        <>
            {contextHolder}
            <Descriptions
                size='small'
                bordered
                style={{marginTop: 10, marginBottom: 10}}
                items={[
                    {
                        label: 'Скорость',
                        children: service.speed === 0 ? '- ? -' : service.speed,
                    },
                    [10001, 10025].indexOf(userData.gidNumber) === -1 ?
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
                        }
                        :
                        {
                            label: (
                                <Row>
                                    <p style={{marginRight: 5}}>Vlan(s)</p>
                                    {service.typeId === 297 && vlanList.length > 0 ?
                                        null
                                        :
                                        <Popconfirm
                                            title="Добавление Vlan"
                                            description={
                                                <InputNumber
                                                    addonBefore="ID"
                                                    precision={0}
                                                    value={vlanId}
                                                    onChange={(value) => setVlanId(value)}
                                                />
                                            }
                                            okText="Добавить"
                                            cancelText="Отмена"
                                            icon={null}
                                            onConfirm={addVlan}
                                        >
                                            <Button size='small' type={'text'}>
                                                <PlusOutlined/>
                                            </Button>
                                        </Popconfirm>
                                    }
                                    {vlanList.length > 0 ?
                                        <Popconfirm
                                            title="Удаление Vlan"
                                            description={
                                                <Select
                                                    defaultValue={vlanList[0]}
                                                    style={{width: '100%'}}
                                                    options={
                                                        vlanList.map(v => (
                                                            {
                                                                value: v,
                                                                label: v,
                                                            }
                                                        ))
                                                    }
                                                    onChange={(value) => setRemoveVlanId(value)}
                                                    value={removeVlanId}
                                                />
                                            }
                                            okText="Удалить"
                                            cancelText="Отмена"
                                            icon={null}
                                            onConfirm={removeVlan}
                                            okButtonProps={{disabled: removeVlanId === null}}
                                        >
                                            <Button size='small' type={'text'}>
                                                <MinusOutlined/>
                                            </Button>
                                        </Popconfirm>
                                        : null
                                    }
                                </Row>
                            ),
                            children: vlanItem,
                        },
                    {
                        label: 'Сервисные документы',
                        span: {xs: 2},
                        children: (
                            <ul style={{listStyle: "none"}}>
                                {service.serviceDocs.files.map((doc, i) => (
                                    <li key={i}>
                                        <a target='_blank'
                                           href={`https://boss.comfortel.pro/service_docs/${service.id}/${doc}`}>
                                            {doc}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ),
                    },
                ]}
            />
        </>
    )
}

export default TechInfoTable
