import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Flex, Layout, Spin, Typography} from "antd";
import Navbar from "../components/navbar.jsx";
import {Content, Header} from "antd/es/layout/layout.js";
import PageNotFound from "./404page.jsx";
import CompanyInfo from "../components/company/companyInfo.jsx";
import CopyToClipboardButton from "../utils/components.jsx";

export default function Company(data) {
    const {companyId} = useParams();
    const isMobile = data.isMobile
    const [isLoading, setIsLoading] = useState(true);
    const [companyItems, setCompanyItems] = useState(true);

    useEffect(() => {
        (async () => {
            const companyItems = await CompanyInfo({companyId: companyId})
            if (companyItems[0]) {
                setCompanyItems(
                    <Layout>
                        <Header style={{display: 'flex', alignItems: 'center', padding: 0, backgroundColor: 'white'}}>
                            <a href="/" style={{marginLeft: 10, height: '70%'}}>
                                <img height='100%' src='/logo.png'/>
                            </a>
                            {!isMobile &&
                                <CopyToClipboardButton
                                    text={companyId}
                                    type='text'
                                    style={{marginLeft: 20}}
                                    item={
                                        <Typography.Title style={{marginTop: 8}}
                                                          level={3}>{`Компания ID: ${companyId}`}
                                        </Typography.Title>
                                    }
                                />
                            }
                            <Navbar userData={data.userData}/>
                        </Header>
                        <Content style={{minHeight: 'calc(100vh - 65px)'}}>
                            {companyItems[1]}
                        </Content>
                    </Layout>
                )
            } else {
                setCompanyItems(<PageNotFound/>)
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

    return companyItems
}
