import React, {useEffect, useState} from "react";
import axios from "axios";
import {Button, Descriptions, Form, Input, notification, Select} from "antd";
import {EditOutlined} from "@ant-design/icons";

const WifiSetupTable = ({service, userData}) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [wifiData, setWifiData] = useState(null);
    const [wifiDataItems, setWifiDataItems] = useState(null);

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

    const checkIsNew = () => {
        let allNull = true
        Object.entries(wifiData).forEach(([k, v]) => {
            if (['type', 'controller_domain', 'router_domain', 'equipment_domain', 'ssid'].indexOf(k) !== -1 && v !== null) {
                allNull = false
            }
        })
        return allNull && (wifiData.id === undefined || wifiData.id === null);
    }

    const editableCell = ({dataIndex, children}) => {
        const index2Item = {
            'type': <Select
                options={[
                    {label: 'Aruba', value: 'Aruba'},
                    {label: 'Unifi', value: 'Unifi'},
                    {label: 'Роутер', value: 'Роутер'},
                    {label: 'Элтех', value: 'Элтех'},
                ]}
            />,
            'controller_domain': <Input/>,
            'router_domain': <Input/>,
            'equipment_domain': <Input/>,
            'ssid': <Input/>,
        }
        return isEditing ? (
            <Form.Item
                name={dataIndex}
                style={{
                    margin: 0,
                }}
            >
                {index2Item[dataIndex]}
            </Form.Item>
        ) : (
            children
        )
    }

    const saveWifiData = async () => {
        try {
            const formResults = await form.validateFields()
            const body = {
                service_id: service.id,
                wifi_type: formResults.type,
                controller_domain: formResults.controller_domain,
                router_domain: formResults.router_domain,
                equipment_domain: formResults.equipment_domain,
                ssid: formResults.ssid,
            }
            try {
                if (checkIsNew()) {
                    await axios.post(
                        `${apiUrl}/service/wifi-setup`,
                        body
                    )
                } else {
                    await axios.put(
                        `${apiUrl}/service/wifi-setup`,
                        body
                    )
                }
                setWifiData({
                    type: formResults.type,
                    controller_domain: formResults.controller_domain,
                    router_domain: formResults.router_domain,
                    equipment_domain: formResults.equipment_domain,
                    ssid: formResults.ssid,
                })
                setIsEditing(!isEditing)
                showSuccess("Информация успешно обновлена!")
            } catch (error) {
                showAlert("Ошибка обновления информации!")
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`${apiUrl}/service/wifi-setup/${service.id}`)
                setWifiData(response.data)
            } catch (error) {
                if (error.response.status === 404) {
                    setWifiData({
                        type: null,
                        controller_domain: null,
                        router_domain: null,
                        equipment_domain: null,
                        ssid: null,
                    })
                }
            }
        })()
    }, [])

    useEffect(() => {
        if (wifiData) {
            setWifiDataItems({
                type: editableCell({dataIndex: 'type', children: wifiData.type}),
                controller_domain: editableCell({dataIndex: 'controller_domain', children: wifiData.controller_domain}),
                router_domain: editableCell({dataIndex: 'router_domain', children: wifiData.router_domain}),
                equipment_domain: editableCell({dataIndex: 'equipment_domain', children: wifiData.equipment_domain}),
                ssid: editableCell({dataIndex: 'ssid', children: wifiData.ssid}),
            })
            setIsLoading(false)
        }
    }, [wifiData, isEditing])

    if (isLoading || service.typeId !== 11797) {
        return null
    }

    return (
        <>
            {contextHolder}
            <Form form={form} component={false} initialValues={wifiData}>
                <Descriptions
                    title='Организация WiFi сети'
                    bordered
                    size='small'
                    column={1}
                    extra={
                        [10001, 10025].indexOf(userData.gidNumber) !== -1 ?
                            isEditing ?
                                <>
                                    <Button size='small' style={{marginRight: 8}}
                                            onClick={() => setIsEditing(!isEditing)}>
                                        Отмена
                                    </Button>
                                    <Button type='primary' size='small' onClick={saveWifiData}>
                                        Сохранить
                                    </Button>
                                </>
                                :
                                <Button
                                    type='text'
                                    size='small'
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    <EditOutlined/>
                                </Button>
                            :
                            null
                    }
                    items={[
                        {
                            label: 'Тип',
                            children: wifiDataItems.type,
                        },
                        {
                            label: 'Контроллер',
                            children: wifiDataItems.controller_domain,
                        },
                        {
                            label: 'Роутер',
                            children: wifiDataItems.router_domain,
                        },
                        {
                            label: 'Доп. оборудование',
                            children: wifiDataItems.equipment_domain,
                        },
                        {
                            label: 'SSID',
                            children: wifiDataItems.ssid,
                        },
                    ]}
                />
            </Form>
        </>
    )
}

export default WifiSetupTable
