import {useParams} from "react-router-dom";
import ServiceInfo from "../components/service/serviceInfo.jsx";
import React, {useEffect, useState} from "react";
import {Button, Flex, Form, Layout, Modal, notification, Select, Space, Spin, Typography} from "antd";
import Navbar from "../components/navbar.jsx";
import {Content, Header} from "antd/es/layout/layout.js";
import PageNotFound from "./404page.jsx";
import TextArea from "antd/es/input/TextArea.js";
import {
    componentId2Field,
    componentId2Name,
    componentId2ShortName,
    field2Variants
} from "../components/service/dicts.js";
import axios from "axios";

export default function Service(data) {
    const {serviceId} = useParams();
    const isMobile = data.isMobile
    const apiUrl = import.meta.env.VITE_API_URL
    const jiraUrl = import.meta.env.VITE_JIRA_URL

    const [isLoading, setIsLoading] = useState(true);
    const [serviceItems, setServiceItems] = useState(true);
    const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
    const [issueFormItems, setIssueFormItems] = useState(null);
    const [formIssueCreate] = Form.useForm();
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

    const showIssueCreation = () => {
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

        const onFinish = (values) => {
            (async () => {
                const extraFields = {}
                for (const k in Object.keys(values)) {
                    if (Object.keys(values)[k].startsWith('customfield')) {
                        extraFields[Object.keys(values)[k]] = {id: values[Object.keys(values)[k]]}
                    }
                }
                extraFields["components"] = values.components.map(id => ({id: id}))
                const body = {
                    summary: values.summary,
                    description: values.description,
                    service_id: parseInt(serviceId),
                    extra_fields: extraFields
                }
                try {
                    const response = await axios.post(
                        `${apiUrl}/jira`,
                        body
                    );

                    showSuccess(`Задача создана - ${response.data.key}`)
                    window.open(`${jiraUrl}/browse/${response.data.key}`,'_blank')
                } catch (error) {
                    showAlert(error.response.data.detail)
                }
                setIsIssueFormOpen(false)
                onReset()
                setIssueFormItems(null)
            })()
        }

        const onReset = () => {
            formIssueCreate.resetFields()
        }

        const onComponentsChange = (value) => {
            formIssueCreate.setFieldsValue({summary: `[${value.map(v => componentId2ShortName[v]).join(", ")}]`})
        }

        const filterOptionComponents = (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

        const validateMessages = {
            required: '${label} обязательно!'
        }

        setIssueFormItems(
            <>
                <Typography.Title level={3} style={{textAlign: 'center'}}>Создание задачи Jira</Typography.Title>
                <Form
                    {...layout}
                    form={formIssueCreate}
                    name="jira-issue-create"
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                    labelWrap={true}
                    style={{
                        marginRight: 50,
                        marginTop: 20
                    }}
                    initialValues={{priority: 'Средний'}}
                >
                    <Form.Item name="components" label="Компоненты" rules={[{required: true}]}>
                        <Select
                            mode="multiple"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            filterOption={filterOptionComponents}
                            onChange={onComponentsChange}
                            options={Object.keys(componentId2Name).map(key => ({
                                value: key,
                                label: componentId2Name[key]
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.components !== currentValues.components}
                    >
                        {({getFieldValue}) =>
                            getFieldValue('components') && getFieldValue('components').length > 0 ? (
                                getFieldValue('components').map((id, i) => (
                                    <Form.Item
                                        key={i}
                                        name={componentId2Field[id]}
                                        label={componentId2Name[id]}
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Select
                                            options={Object.keys(field2Variants[componentId2Field[id]]).map(key => ({
                                                value: key,
                                                label: field2Variants[componentId2Field[id]][key]
                                            }))}
                                        />
                                    </Form.Item>
                                ))
                            ) : null
                        }
                    </Form.Item>
                    <Form.Item name="summary" label="Название" rules={[{required: true}]}>
                        <TextArea autoSize allowClear onPressEnter={(e) => {
                            e.preventDefault()
                        }}/>
                    </Form.Item>
                    <Form.Item name="description" label="Описание" rules={[{required: true}]}>
                        <TextArea allowClear/>
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
        setIsIssueFormOpen(true)
    }

    const hideIssueCreation = () => {
        setIssueFormItems(null)
        setIsIssueFormOpen(false)
    }

    useEffect(() => {
        (async () => {
            const serviceItems = await ServiceInfo({
                serviceId: serviceId,
                pdfWidth: data.windowWidth * 0.6,
                showIssueCreation: showIssueCreation
            })
            if (serviceItems[0]) {
                setServiceItems(
                    <Layout>
                        <Header style={{display: 'flex', alignItems: 'center', padding: 0, backgroundColor: 'white'}}>
                            <a href="/" style={{marginLeft: 10, height: '70%'}}>
                                <img height='100%' src='/logo.png'/>
                            </a>
                            {!isMobile &&
                                <div style={{display: 'flex', width: '100%', marginLeft: 20, paddingTop: 5}}>
                                    <Typography.Title level={3}>{`Услуга ID: ${serviceId}`}</Typography.Title>
                                </div>
                            }
                            <Navbar userData={data.userData}/>
                        </Header>
                        <Content style={{minHeight: 'calc(100vh - 65px)'}}>
                            {contextHolder}
                            <Modal open={isIssueFormOpen} onCancel={hideIssueCreation} footer={null}
                                   width={isMobile ? '90%' : '50%'}>
                                {issueFormItems}
                            </Modal>
                            {serviceItems[1]}
                        </Content>
                    </Layout>
                )
            } else {
                setServiceItems(<PageNotFound/>)
            }
            setIsLoading(false)
        })()
    }, [isIssueFormOpen]);

    if (isLoading) {
        return (
            <Flex justify="center" align="center" style={{width: '100%', height: '100vh'}}>
                <Spin/>
            </Flex>
        )
    }

    return serviceItems
}
