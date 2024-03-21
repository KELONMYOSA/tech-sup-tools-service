import {Col, Flex, Layout, Row, Spin, Typography} from "antd";
import {Content, Header} from "antd/es/layout/layout.js";
import Navbar from "../components/navbar.jsx";
import React, {useState} from "react";
import ServiceCard from "../components/home/serviceCard.jsx";
import SearchBar from "../components/home/searchBar.jsx";

export default function Home(data) {
    const [servicesData, setServicesData] = useState(null);
    const [pageContentIsLoading, setPageContentIsLoading] = useState(false);

    const isMobile = data.isMobile

    let pageContent
    if (pageContentIsLoading) {
        pageContent = isMobile ?
            <Flex justify="center" align="center" style={{width: '100%', height: 'calc(100vh - 130px)'}}>
                <Spin/>
            </Flex> :
            <Flex justify="center" align="center" style={{width: '100%', height: 'calc(100vh - 65px)'}}>
                <Spin/>
            </Flex>
    } else {
        pageContent = (
            <Row>
                <Col flex='auto' style={{padding: 20}}>
                    <ServiceCard servicesData={servicesData}/>
                </Col>
            </Row>
        )
    }

    return (
        <Layout>
            <Header style={{display: 'flex', alignItems: 'center', padding: 0, backgroundColor: 'white'}}>
                <Row justify='space-between' align='middle' style={{height: '65px', width: '100%'}}>
                    <Col order={0} style={{height: '100%'}}>
                        <Row align='middle' xs={{flex: '50px'}} md={{flex: '0 1 350px'}}
                             style={{marginLeft: 10, height: '100%'}}>
                            <img src='/logo.png' height='70%'/>
                            {!isMobile &&
                                <div style={{marginLeft: 20, paddingTop: 5}}>
                                    <Typography.Title level={3}>Техническая поддержка</Typography.Title>
                                </div>
                            }
                        </Row>
                    </Col>
                    <Col xs={{span: 24, order: 3}} lg={{span: 7, order: 1}} xl={9} xxl={8}
                         style={{
                             paddingLeft: 20,
                             paddingRight: 20,
                             paddingBottom: 10,
                             marginTop: -10,
                             backgroundColor: 'white'
                         }}
                    >
                        <SearchBar
                            updateServicesData={setServicesData}
                            updateContentIsLoading={setPageContentIsLoading}
                        />
                    </Col>
                    <Col order={2} xs={{flex: '50px'}} md={{flex: '0 1 330px'}} style={{height: '100%'}}>
                        <Navbar userData={data.userData}/>
                    </Col>
                </Row>
            </Header>
            {isMobile ?
                <Content style={{minHeight: 'calc(100vh - 130px)', marginTop: 65}}>
                    {pageContent}
                </Content> :
                <Content style={{minHeight: 'calc(100vh - 65px)'}}>
                    {pageContent}
                </Content>
            }
        </Layout>
    )
}
