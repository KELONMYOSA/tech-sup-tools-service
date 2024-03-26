import {Col, Flex, Layout, Row, Spin} from "antd";
import {Content, Header} from "antd/es/layout/layout.js";
import Navbar from "../components/navbar.jsx";
import React, {useEffect, useRef, useState} from "react";
import ServiceCard from "../components/home/serviceCard.jsx";
import SearchBar from "../components/home/searchBar.jsx";
import {useSearchParams} from "react-router-dom";

export default function Home(data) {
    const [servicesData, setServicesData] = useState(null);
    const [pageContentIsLoading, setPageContentIsLoading] = useState(false);
    const [headerHeight, setHeaderHeight] = useState('65px');
    const headerRef = useRef(null);

    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setHeaderHeight(`${entry.contentRect.height}px`);
            }
        });
        if (headerRef.current) {
            resizeObserver.observe(headerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    let pageContent
    if (pageContentIsLoading) {
        pageContent = (
            <Flex justify="center" align="center" style={{width: '100%', height: `calc(100vh - ${headerHeight})`}}>
                <Spin/>
            </Flex>
        )
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
            <Header ref={headerRef}
                    style={{display: 'flex', padding: 0, backgroundColor: 'white', minHeight: '65px', height: 'auto'}}>
                <Row justify='space-between' align='middle' style={{minHeight: '65px', width: '100%'}}>
                    <Col order={0}>
                        <Row align='middle' flex='auto'
                             style={{marginLeft: 10, height: '65px'}}>
                            <img src='/logo.png' height='70%'/>
                        </Row>
                    </Col>
                    <Col xs={{order: 3, span: 24}} xxl={{order: 1, span: 20}}>
                        <SearchBar
                            updateServicesData={setServicesData}
                            updateContentIsLoading={setPageContentIsLoading}
                            searchParams={searchParams}
                            updateSearchParams={setSearchParams}
                        />
                    </Col>
                    <Col order={2} style={{height: '65px'}}>
                        <Navbar userData={data.userData}/>
                    </Col>
                </Row>
            </Header>
            <Content style={{minHeight: `calc(100vh - ${headerHeight})`}}>
                {pageContent}
            </Content>
        </Layout>
    )
}
