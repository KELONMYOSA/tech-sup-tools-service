import {useParams} from "react-router-dom";
import ServiceInfo from "../components/home/serviceInfo.jsx";
import React, {useEffect, useState} from "react";
import {Flex, Layout, Spin, Typography} from "antd";
import Navbar from "../components/home/navbar.jsx";
import {Content, Header} from "antd/es/layout/layout.js";
import PageNotFound from "./404page.jsx";

export default function Service(data) {
    const {serviceId} = useParams();
    const isMobile = data.isMobile
    const [isLoading, setIsLoading] = useState(true);
    const [serviceItems, setServiceItems] = useState(true);

    useEffect(() => {
        (async () => {
            const serviceItems = await ServiceInfo({serviceId: serviceId})
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
                            {serviceItems[1]}
                        </Content>
                    </Layout>
                )
            } else {
                setServiceItems(<PageNotFound/>)
            }
            setIsLoading(false)
        })()
    }, []);

    if (isLoading) {
        return (
            <Flex justify="center" align="center" style={{width: '100%', height: '100vh'}}>
                <Spin/>
            </Flex>
        )
    }

    return serviceItems
}
