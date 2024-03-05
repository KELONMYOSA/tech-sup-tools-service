import {Menu} from "antd";
import {MenuOutlined} from "@ant-design/icons";

export default function Navbar(data) {
    const userData = data.userData
    const items = [
        {
            label: userData.uid,
            key: 'userMenu',
            children: [
                {
                    label: 'Выйти',
                    key: 'logout',
                    danger: true
                }
            ]
        },
        {
            icon: <MenuOutlined/>,
            key: 'services',
            children: [
                {
                    label: (
                        <a href='https://netbox.comfortel.pro' target="_blank">
                            Тех.учет ip, vlans, стойки в дц и прочее
                        </a>
                    )
                },
                {
                    label: (
                        <a href='http://hep.comfortel.pro:3000' target="_blank">
                            Анализ dump по SIP серверам
                        </a>
                    )
                },
            ]
        }
    ]

    const onClick = (e) => {
        if (e.key === 'logout') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.reload()
        }
    };

    return <Menu
        onClick={onClick}
        mode="horizontal"
        style={{height: '100%', width: '100%', alignItems: 'center', justifyContent: 'end'}}
        items={items}
    />
}
