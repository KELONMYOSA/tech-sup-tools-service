import {Col, Layout, Row, Typography} from "antd";
import {Content, Header} from "antd/es/layout/layout.js";
import Navbar from "../components/navbar.jsx";
import useWindowSize from "../utils/useWindowSize.js";
import Search from "antd/es/input/Search.js";
import {PhoneOutlined} from "@ant-design/icons";

export default function Home(data) {
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
            <Content>
                <Row>
                    <Col flex={1} style={{padding: 8}}>
                        <Search size="large" addonBefore={<PhoneOutlined/>} placeholder="Номер телефона" enterButton />
                    </Col>
                    <Col flex={1} style={{padding: 8}}>

                    </Col>
                    <Col flex={1} style={{padding: 8}}>

                    </Col>
                </Row>
            </Content>
        </Layout>
    )
}
