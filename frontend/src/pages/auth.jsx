import {Button, Checkbox, Form, Input, Space, Typography} from 'antd';

const onFinish = (values) => {
    console.log('Success:', values);
}
const onFinishFailed = () => {
    console.log('Authentication Failed!');
}

export default function Auth() {
    const pageStyle = {
        justifyContent: "center",
        width: '100%',
        height: '100vh',
    }

    return (
        <Space style={pageStyle} direction="vertical" align="center" size="small">
            <Typography.Title>LDAP Authentication</Typography.Title>
            <Form
                name="auth"
                labelCol={{
                    span: 6,
                }}
                style={{
                    paddingTop: 20,
                    paddingLeft: 30,
                    paddingRight: 30,
                    borderRadius: 6,
                    border: "1px solid",
                    borderColor: "lightgray"
                }}
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="Логин"
                    name="login"
                    rules={[
                        {
                            required: true,
                            message: 'Пожалуйста, введите логин!',
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Пожалуйста, введите пароль!',
                        },
                    ]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    name="remember"
                    valuePropName="checked"
                >
                    <Checkbox>Запомнить меня</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Войти
                    </Button>
                </Form.Item>
            </Form>
        </Space>
    )
}