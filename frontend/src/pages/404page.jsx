import {Button, Space, Typography} from "antd";

export default function PageNotFound() {
    const pageStyle = {
        justifyContent: "center",
        width: '100%',
        height: '100vh',
    }

    return (
        <Space style={pageStyle} direction="vertical" align="center" size="large">
            <Typography.Title style={{fontSize:"100px"}}>404</Typography.Title>
            <Typography.Title level={3} style={{textAlign: "center"}}>Sorry, the page you visited does not exist.</Typography.Title>
            <Button type="primary" href="/">Back Home</Button>
        </Space>
    )
}
