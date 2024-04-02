import {Col, Row} from "antd";
import React, {useState} from "react";
import ServiceCard from "../components/home/serviceCard.jsx";
import PageTemplate from "../components/pageTemplate.jsx";

export default function Home(data) {
    const [headerHeight, setHeaderHeight] = useState('64px');
    const [servicesData, setServicesData] = useState(null);

    const pageContent = (
        <Row>
            <Col flex='auto' style={{padding: 20}}>
                <ServiceCard servicesData={servicesData} headerHeight={headerHeight}/>
            </Col>
        </Row>
    )

    return <PageTemplate
        isMain={true}
        userData={data.userData}
        content={pageContent}
        setServicesData={setServicesData}
        headerHeight={headerHeight}
        setHeaderHeight={setHeaderHeight}
    />
}
