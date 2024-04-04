import {useParams} from "react-router-dom";
import ServiceInfo from "../components/service/serviceInfo.jsx";
import React, {useEffect, useRef, useState} from "react";
import {Button, Flex, Form, Layout, Modal, notification, Select, Space, Spin, Typography} from "antd";
import PageNotFound from "./404page.jsx";
import TextArea from "antd/es/input/TextArea.js";
import {
    componentId2Field,
    componentId2Name,
    componentId2ShortName,
    field2Variants, serviceType2componentId
} from "../components/service/dicts.js";
import axios from "axios";
import PageTemplate from "../components/pageTemplate.jsx";

export default function Service(data) {
    const {serviceId} = useParams();
    const isMobile = data.isMobile
    const [headerHeight, setHeaderHeight] = useState('64px');
    const apiUrl = import.meta.env.VITE_API_URL
    const jiraUrl = import.meta.env.VITE_JIRA_URL

    const [isLoading, setIsLoading] = useState(true);
    const [serviceItems, setServiceItems] = useState(true);
    const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
    const [isVisibleAddressAdd, setIsVisibleAddressAdd] = useState(true);
    const [issueFormItems, setIssueFormItems] = useState(null);
    const serviceFormData = useRef({});
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
        setIsIssueFormOpen(true)
    }

    const hideIssueCreation = () => {
        setIsIssueFormOpen(false)
    }

    useEffect(() => {
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
                values['customfield_11255'] = '18620'
                const extraFields = {}
                for (const k in Object.keys(values)) {
                    if (Object.keys(values)[k].startsWith('customfield')) {
                        extraFields[Object.keys(values)[k]] = {id: values[Object.keys(values)[k]]}
                    }
                }
                extraFields["components"] = values.components.map(id => ({id: id}))
                extraFields["customfield_11200"] = `${serviceFormData.current.company} (id=${serviceFormData.current.companyId})`
                extraFields["customfield_11258"] = values.complainer
                const body = {
                    summary: values.summary,
                    description: values.description,
                    service_id: serviceId,
                    assignee: data.userData.uid,
                    extra_fields: extraFields
                }
                try {
                    const response = await axios.post(
                        `${apiUrl}/jira`,
                        body
                    );

                    showSuccess(`Задача создана - ${response.data.key}`)
                    window.open(`${jiraUrl}/browse/${response.data.key}`, '_blank')
                } catch (error) {
                    showAlert(error.response.data.detail)
                }
                setIsIssueFormOpen(false)
                onReset()
                setIssueFormItems(null)
                formIssueCreate.resetFields()
                setIsVisibleAddressAdd(true)
            })()
        }

        const onReset = () => {
            formIssueCreate.setFieldsValue({components: null, summary: null, description: null, complainer: null})
            setIsVisibleAddressAdd(true)
        }

        const onComponentsChange = (value) => {
            if (value.length === 0) {
                formIssueCreate.setFieldsValue({summary: null})
            } else {
                formIssueCreate.setFieldsValue({summary: `${serviceFormData.current.company} (id=${serviceFormData.current.companyId}) [${value.map(v => componentId2ShortName[v]).join(", ")}]`})
            }
            setIsVisibleAddressAdd(true)
        }

        const filterOptionComponents = (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

        const validateMessages = {
            required: '${label} обязательно!'
        }

        const addAddressToSummary = () => {
            formIssueCreate.setFieldValue(
                'summary',
                formIssueCreate.getFieldValue('summary') + ' ' + serviceFormData.current.addresses.map((address, i) =>
                    `${address.city}${!['', ' '].includes(address.street) ? `, ${address.street}` : ''}${!['', ' '].includes(address.house) ? `, ${address.house}` : ''}${!['', ' '].includes(address.building) ? `, ${address.building}` : ''}${!['', ' '].includes(address.letter) ? ` ${address.letter}` : ''}${!['', ' '].includes(address.flat) ? `, кв. ${address.flat}` : ''}`
                ).join(' - ')
            )
            setIsVisibleAddressAdd(false)
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
                    initialValues={{
                        components: serviceFormData.current.type in serviceType2componentId ?
                            [serviceType2componentId[serviceFormData.current.type].toString()]
                            : null,
                        summary: `${serviceFormData.current.company} (id=${serviceFormData.current.companyId})${serviceFormData.current.type in serviceType2componentId ? ' [' + componentId2ShortName[serviceType2componentId[serviceFormData.current.type]] + ']' : ''}`
                    }}
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
                    <Form.Item name="complainer" label="Обратившееся лицо">
                        <TextArea
                            autoSize
                            allowClear
                            onPressEnter={(e) => {
                                e.preventDefault()
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="summary" label="Название" rules={[{required: true}]}>
                        <TextArea
                            autoSize
                            allowClear
                            onPressEnter={(e) => {
                                e.preventDefault()
                            }}
                            onChange={(e) => {
                                if (e.target.value.length === 0) {
                                    setIsVisibleAddressAdd(true)
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        {...tailLayout}
                        style={{
                            marginBottom: '12px',
                            marginTop: '-24px',
                            display: isVisibleAddressAdd ? 'block' : 'none'
                        }}
                    >
                        <Button type='link' size='small' style={{paddingLeft: 0}} onClick={addAddressToSummary}>
                            Добавить адрес
                        </Button>
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
    }, [isIssueFormOpen, isVisibleAddressAdd])

    useEffect(() => {
        (async () => {
            const serviceItems = await ServiceInfo({
                serviceId: serviceId,
                pdfWidth: data.windowWidth * 0.6,
                showIssueCreation: showIssueCreation
            })
            serviceFormData.current = serviceItems[1]
            if (serviceItems[0]) {
                setServiceItems(
                    <PageTemplate
                        isMain={false}
                        userData={data.userData}
                        content={
                            <>
                                {contextHolder}
                                <Modal open={isIssueFormOpen} onCancel={hideIssueCreation} footer={null}
                                       width={isMobile ? '90%' : '50%'}>
                                    {issueFormItems}
                                </Modal>
                                {serviceItems[2]}
                            </>
                        }
                        headerHeight={headerHeight}
                        setHeaderHeight={setHeaderHeight}
                    />
                )
            } else {
                setServiceItems(<PageNotFound/>)
            }
            setIsLoading(false)
        })()
    }, [issueFormItems]);

    if (isLoading) {
        return (
            <Layout>
                <Flex justify="center" align="center" style={{width: '100%', height: '100vh'}}>
                    <Spin/>
                </Flex>
            </Layout>
        )
    }

    return serviceItems
}
