import {Button, Flex, Form, Input, notification, Select, Space, Spin, Typography} from "antd";
import React, {useEffect, useState} from "react";
import axios from "axios";

const NetboxCreateDeviceForm = ({handleCancel}) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const netboxUrl = import.meta.env.VITE_NETBOX_URL
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const [isLoading, setIsLoading] = useState(true);
    const [netboxChoices, setNetboxChoices] = useState(null);

    const layout = {
        labelCol: {
            span: 8,
        },
        wrapperCol: {
            span: 16,
        },
    }

    const tailLayout = {
        wrapperCol: {
            offset: 8,
            span: 16,
        },
    };

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

    const onFinish = (values) => {
        (async () => {
            const body = {
                name: values.name,
                role: values.deviceRole,
                device_type: values.deviceType,
                serial: values.serialNumber,
                asset_tag: values.assetTag,
                site: values.site,
                status: values.status,
            }
            try {
                const response = await axios.post(
                    `${apiUrl}/netbox/devices`,
                    body
                );

                showSuccess("Устройство создано!")
                window.open(`${netboxUrl}/dcim/devices/${response.data.id}`, '_blank')
            } catch (error) {
                showAlert(error.response.data.detail)
            }
            onReset()
            handleCancel()
        })()
    }

    const onReset = () => {
        form.resetFields()
    }

    const validateMessages = {
        required: '${label} обязательно!'
    }

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`${apiUrl}/netbox/devices/choices`)
                setNetboxChoices(response.data)
                setIsLoading(false)
            } catch (error) {
                console.error(error)
            }
        })()
    }, []);

    if (isLoading) {
        return (
            <Flex justify="center" align="center" style={{width: '100%', height: '100px'}}>
                <Spin/>
            </Flex>
        )
    }

    return (
        <>
            {contextHolder}
            <Typography.Title level={3} style={{textAlign: 'center'}}>Netbox - Создание устройства</Typography.Title>
            <Form
                {...layout}
                form={form}
                name="netbox-device-create"
                onFinish={onFinish}
                validateMessages={validateMessages}
                labelWrap={true}
                requiredMark={false}
                style={{
                    marginRight: 50,
                    marginTop: 20
                }}
            >
                <Form.Item name="name" label="Name" rules={[{required: true}]} tooltip='Доменка (заполняется вручную)'>
                    <Input/>
                </Form.Item>
                <Form.Item name="deviceRole" label="Device role" rules={[{required: true}]} tooltip='Роль оборудования (из всплывающего, если нет, то создается новая роль вручную в нетбоксе)'>
                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={netboxChoices.deviceRoles.map(role => ({value: role.id, label: role.name}))}
                    />
                </Form.Item>
                <Form.Item name="deviceType" label="Device type" rules={[{required: true}]} tooltip='Модель оборудования'>
                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={netboxChoices.deviceTypes.map(t => ({value: t.id, label: t.name}))}
                    />
                </Form.Item>
                <Form.Item name="serialNumber" label="Serial number" rules={[{required: true}]} tooltip='Серийный номер (заполняется вручную)'>
                    <Input/>
                </Form.Item>
                <Form.Item name="assetTag" label="Asset tag" rules={[{required: true}]} tooltip='Инвентарный номер по физическому складу (заполняется вручную)'>
                    <Input/>
                </Form.Item>
                <Form.Item name="site" label="Site" rules={[{required: true}]} tooltip='Выбрать из всплывающего, если существующий. Если новый, то заполнить новую форму'>
                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={netboxChoices.sites.map(s => ({value: s.id, label: s.name}))}
                    />
                </Form.Item>
                <Form.Item name="status" label="Status" rules={[{required: true}]} tooltip='Выбрать из всплывающего'>
                    <Select
                        options={netboxChoices.statuses.map(s => ({value: s.value, label: s.display_name}))}
                    />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Создать
                        </Button>
                        <Button htmlType="button" onClick={onReset}>
                            Очистить
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </>
    )
}

export default NetboxCreateDeviceForm;