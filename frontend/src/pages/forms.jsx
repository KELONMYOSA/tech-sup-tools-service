import React, {useState} from "react";
import PageTemplate from "../components/pageTemplate.jsx";
import {Button, Divider, Flex, List, Modal} from "antd";
import {PlusCircleOutlined} from "@ant-design/icons";
import NetboxCreateDeviceForm from "../components/forms/netboxCreateDevice.jsx";
import NetboxCreateSiteForm from "../components/forms/netboxCreateSite.jsx";

export default function Forms(data) {
    const [headerHeight, setHeaderHeight] = useState('64px');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const showModal = (content) => {
        setModalContent(content)
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const netboxFormsData = [
        {
            title: 'Устройство',
            content: <NetboxCreateDeviceForm handleCancel={handleCancel}/>,
        },
        {
            title: 'Узел',
            content: <NetboxCreateSiteForm handleCancel={handleCancel}/>,
        },
    ];

    const pageContent = (
        <Flex vertical align='start' style={{marginTop: 10}}>
            <Divider orientation="left">Netbox - Создание оборудования</Divider>
            <List
                split={false}
                style={{marginLeft: '5%'}}
                dataSource={netboxFormsData}
                renderItem={(item) => (
                    <List.Item style={{padding: '6px 0'}}>
                        <Button type='text' icon={<PlusCircleOutlined/>} onClick={() => showModal(item.content)}>
                            {item.title}
                        </Button>
                    </List.Item>
                )}
            />
        </Flex>
    )

    return (
        <>
            <PageTemplate
                isMain={false}
                searchBarEnabled={false}
                userData={data.userData}
                content={pageContent}
                headerHeight={headerHeight}
                setHeaderHeight={setHeaderHeight}
            />
            <Modal open={isModalOpen} onCancel={handleCancel} footer={null} style={{minWidth: '50%'}}>
                {modalContent}
            </Modal>
        </>
    )
}