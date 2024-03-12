import {Col, Layout, Row, Typography} from "antd";
import {Content, Header} from "antd/es/layout/layout.js";
import Navbar from "../components/home/navbar.jsx";
import useWindowSize from "../utils/useWindowSize.js";
import SearchClientByPhoneNumber from "../components/home/phoneSearch.jsx";
import {useState} from "react";
import CompanyCard from "../components/home/companyCard.jsx";
import ServiceCard from "../components/home/serviceCard.jsx";

export default function Home(data) {
    const [companyIds, setCompanyIds] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');

    const isMobile = useWindowSize().width < 600
    return (
        <Layout>
            <Header style={{display: 'flex', alignItems: 'center', padding: 0, backgroundColor: 'white'}}>
                <img src='/logo.png' height='70%' style={{marginLeft: 10}}/>
                {!isMobile &&
                    <div style={{display: 'flex', width: '100%', marginLeft: 20, paddingTop: 5}}>
                        <Typography.Title level={3}>Техническая поддержка</Typography.Title>
                    </div>
                }
                <Navbar userData={data.userData}/>
            </Header>
            <Content style={{minHeight: 'calc(100vh - 65px)'}}>
                <Row>
                    <Col xs={{flex: '100%'}} md={{flex: '1 2'}} style={{padding: 20}}>
                        <SearchClientByPhoneNumber
                            updateCompanies={setCompanyIds}
                            updatePhone={setPhoneNumber}
                            phone={phoneNumber}
                        />
                        <CompanyCard companyIds={companyIds} isMobile={isMobile}/>
                    </Col>
                    <Col flex='2 1' style={{padding: 20}}>
                        <ServiceCard companyIds={companyIds} isMobile={isMobile}/>
                    </Col>
                </Row>
            </Content>
        </Layout>
    )
}
