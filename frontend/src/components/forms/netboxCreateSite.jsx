import {Button, Flex, Form, Input, notification, Select, Space, Spin, Typography} from "antd";
import React, {useEffect, useState} from "react";
import axios from "axios";
import TextArea from "antd/es/input/TextArea.js";

const NetboxCreateSiteForm = ({handleCancel}) => {
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
                slug: values.slug,
                status: values.status,
                region: values.region,
                physical_address: values.address,
                comments: values.comments,
                custom_fields: {aes_unit_id: values.aes},
            }
            try {
                const response = await axios.post(
                    `${apiUrl}/netbox/sites`,
                    body
                );

                showSuccess("Узел создан!")
                window.open(`${netboxUrl}/dcim/sites/${response.data.id}`, '_blank')
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
                const response = await axios.get(`${apiUrl}/netbox/sites/choices`)
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
            <Typography.Title level={3} style={{textAlign: 'center'}}>Netbox - Создание узла</Typography.Title>
            <Form
                {...layout}
                form={form}
                name="netbox-site-create"
                onFinish={onFinish}
                validateMessages={validateMessages}
                labelWrap={true}
                requiredMark={false}
                style={{
                    marginRight: 50,
                    marginTop: 20
                }}
            >
                <Form.Item name="name" label="Name" rules={[{required: true}]} tooltip='Название узла'>
                    <Input/>
                </Form.Item>
                <Form.Item name="slug" label="Slug" rules={[{required: true}]} tooltip='Название узла на англ. (как вариант)'>
                    <Input/>
                </Form.Item>
                <Form.Item name="status" label="Status" rules={[{required: true}]} tooltip='Выбрать из всплывающего'>
                    <Select
                        options={netboxChoices.statuses.map(s => ({value: s.value, label: s.display_name}))}
                    />
                </Form.Item>
                <Form.Item name="region" label="Region" rules={[{required: true}]} tooltip='Выбрать из всплывающего, если нет, то создается новая роль вручную в нетбоксе'>
                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={netboxChoices.regions.map(role => ({value: role.id, label: role.name}))}
                    />
                </Form.Item>
                <Form.Item name="address" label="Physical address" rules={[{required: true}]} tooltip='Адрес – заполняется полностью'>
                    <TextArea/>
                </Form.Item>
                <Form.Item name="aes" label="AES Unit ID" rules={[{required: true}]} tooltip='Биллинг -> Тех.Ресурсы -> Узлы -> Общая информация -> ID UNIT'>
                    <Input/>
                </Form.Item>
                <Form.Item name="comments" label="Comments" tooltip='Комментарий – для ссылки на задачу, добавления подробности и в дальнейшем ссылки на некстклауд, где будет храниться СоС, файлы и фотграфии'>
                    <TextArea/>
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

export default NetboxCreateSiteForm;