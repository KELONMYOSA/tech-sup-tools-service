import {Col, Flex, Layout, Row, Spin} from "antd";
import {Content, Header} from "antd/es/layout/layout.js";
import Navbar from "../components/navbar.jsx";
import React, {useEffect, useRef, useState} from "react";
import SearchBar from "../components/home/searchBar.jsx";
import {useSearchParams} from "react-router-dom";
import {useThemeMode} from "antd-style";

export default function PageTemplate({
                                         userData,
                                         content,
                                         setServicesData,
                                         headerHeight,
                                         setHeaderHeight,
                                         isMain,
                                         searchBarEnabled = true
                                     }) {
    const [pageContentIsLoading, setPageContentIsLoading] = useState(false);
    const headerRef = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams()
    const {appearance} = useThemeMode();

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (setHeaderHeight) {
                    setHeaderHeight(`${entry.contentRect.height}px`);
                }
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
        pageContent = content
    }

    return (
        <Layout>
            <Header ref={headerRef}
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        display: 'flex',
                        padding: 0,
                        minHeight: '65px',
                        height: 'auto'
                    }}>
                <Row justify='space-between' align='middle' style={{minHeight: '65px', width: '100%'}}>
                    <Col order={0}>
                        <Row align='middle' flex='auto'
                             style={{marginLeft: 10, height: '65px'}}>
                            <a href="/" style={{height: '70%'}}>
                                {appearance === 'light'
                                    ?
                                    <img height='100%' src='/logo.png'/>
                                    :
                                    <img height='100%' src='/logo-dark-theme.png'/>
                                }
                            </a>
                        </Row>
                    </Col>
                    {
                        searchBarEnabled
                            ?
                            <Col xs={{order: 3, span: 24}} xxl={{order: 1, span: 20}}>
                                <SearchBar
                                    updateServicesData={setServicesData}
                                    updateContentIsLoading={setPageContentIsLoading}
                                    searchParams={searchParams}
                                    updateSearchParams={setSearchParams}
                                    isMain={isMain}
                                />
                            </Col>
                            :
                            null
                    }
                    <Col order={2} style={{height: '65px'}}>
                        <Navbar userData={userData}/>
                    </Col>
                </Row>
            </Header>
            <Content style={{minHeight: `calc(100vh - ${headerHeight})`}}>
                {pageContent}
            </Content>
        </Layout>
    )
}
