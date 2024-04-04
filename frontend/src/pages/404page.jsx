import {Button, Layout, Space, Typography} from "antd";

export default function PageNotFound() {
    const pageStyle = {
        justifyContent: "center",
        width: '100%',
        height: '100vh',
    }

    return (
        <Layout>
            <Space style={pageStyle} direction="vertical" align="center" size="large">
                <Typography.Title style={{fontSize: "100px"}}>404</Typography.Title>
                <Typography.Title level={3} style={{textAlign: "center"}}>Страница, на которую вы пытаетесь попасть, не
                    существует.</Typography.Title>
                <Button type="primary" href="/">На главную</Button>
            </Space>
        </Layout>
    )
}
