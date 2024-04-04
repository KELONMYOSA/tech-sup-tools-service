import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Flex, Layout, Spin} from "antd";
import PageNotFound from "./404page.jsx";
import CompanyInfo from "../components/company/companyInfo.jsx";
import PageTemplate from "../components/pageTemplate.jsx";

export default function Company(data) {
    const {companyId} = useParams();
    const [headerHeight, setHeaderHeight] = useState('64px');
    const [isLoading, setIsLoading] = useState(true);
    const [companyItems, setCompanyItems] = useState(true);

    useEffect(() => {
        (async () => {
            const companyItems = await CompanyInfo({companyId: companyId})
            if (companyItems[0]) {
                setCompanyItems(
                    <PageTemplate
                        isMain={false}
                        userData={data.userData}
                        content={companyItems[1]}
                        headerHeight={headerHeight}
                        setHeaderHeight={setHeaderHeight}
                    />
                )
            } else {
                setCompanyItems(<PageNotFound/>)
            }
            setIsLoading(false)
        })()
    }, []);

    if (isLoading) {
        return (
            <Layout>
                <Flex justify="center" align="center" style={{width: '100%', height: '100vh'}}>
                    <Spin/>
                </Flex>
            </Layout>
        )
    }

    return companyItems
}
