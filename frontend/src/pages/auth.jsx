import {Button, Form, Input, Layout, notification, Space, Typography} from 'antd';

export default function Auth() {
    const apiUrl = import.meta.env.VITE_API_URL;

    const [api, contextHolder] = notification.useNotification();
    const showAlert = (msg) => {
        api.error({
            message: msg,
            placement: 'topRight'
        })
    }

    const onFinish = (values) => {
        let formData = new FormData();
        formData.append('username', values.username);
        formData.append('password', values.password);

        fetch(apiUrl + '/auth/token', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) throw new Error('Неверный логин или пароль');
                response.json()
                    .then(data => {
                        localStorage.setItem('token', data.access_token);
                        localStorage.setItem('refreshToken', data.refresh_token);
                        window.location.reload()
                    })
            })
            .catch((error) => {
                showAlert(error.message)
            });
    };

    const onFinishFailed = () => {
        console.log('Authentication Failed!');
    }

    const pageStyle = {
        justifyContent: "center",
        width: '100%',
        height: '100vh',
    }

    return (
        <Layout>
            <Space style={pageStyle} direction="vertical" align="center" size="small">
                {contextHolder}
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
                        name="username"
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

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Layout>
    )
}
