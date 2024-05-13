import {Menu} from "antd";
import {LogoutOutlined, MenuOutlined, SettingOutlined} from "@ant-design/icons";

export default function Navbar(data) {
    const userData = data.userData
    const items = [
        {
            label: userData.uid,
            key: 'userMenu',
            children: [
                {
                    label: 'Настройки',
                    icon: <SettingOutlined />,
                    key: 'settings',
                },
                {
                    label: 'Выйти',
                    icon: <LogoutOutlined />,
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
                    key: 'forms',
                    label: (
                        <a href='/forms'>Формы</a>
                    )
                },
                {
                    key: 'links',
                    label: 'Ссылки',
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
                        {
                            label: (
                                <a href='https://tools.comfortel.pro/wifi/authlog.php' target="_blank">
                                    Wi-Fi auth log
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://tools.comfortel.pro/as/aes/vlans2' target="_blank">
                                    Выгрузки услуг из биллинга по id-услуг или id-vlan
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://tools.comfortel.pro/ipmac2/' target="_blank">
                                    Поиск маков, история на портах
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='http://nfsen.comfortel.pro/' target="_blank">
                                    Web-ка для просмотра Netflow
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='http://antifraud.voip.comfortel.pro:8092/' target="_blank">
                                    Антифрод voip
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='http://lg.comfortel.pro/' target="_blank">
                                    Комфортеловский Looking Glass
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://calendar.google.com/calendar/u/0?cid=am5qdDNuYnBpcmN2cTdrZWhvNXZlNTluaXNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ' target="_blank">
                                    Календарь - Плановые и Аварийные работы
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://docs.google.com/spreadsheets/d/1Ze9IVWfpOY9zoayJV4M5tghJtLgObXEGzB-ohcSTybc/edit#gid=441148252' target="_blank">
                                    График дежурств
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://docs.google.com/spreadsheets/d/1QEbpKjR5IVQpOQlXH-AtSXBLLXbXPtDLVNlgA0HiQ5w/edit?usp=sharing' target="_blank">
                                    Сводный документ по работам в техарбайтунге
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://nextcloud.comfortel.pro' target="_blank">
                                    Nextcloud
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://geo.roing.com/portal/home/webmap/viewer.html?webmap=b19ca4e386714f558f1a3eee2c0a6475' target="_blank">
                                    Карта
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://rosseti-lenenergo.ru/planned_work/' target="_blank">
                                    Работы ЛенЭнерго СБП
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://rossetimr.ru/client/disconnection/#tab-planovie-otkluchenia' target="_blank">
                                    Работы Россети МСК
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://zbxweb.comfortel.pro' target="_blank">
                                    Zabbix
                                </a>
                            )
                        },
                        {
                            label: (
                                <a href='https://wiki.comfortel.pro/' target="_blank">
                                    CMFT WIKI
                                </a>
                            )
                        },
                    ],
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
        if (e.key === 'settings') {
            window.open('/settings', '_self')
        }
    };

    return <Menu
        onClick={onClick}
        selectable={false}
        mode="horizontal"
        style={{height: '100%', width: '100%', alignItems: 'center', justifyContent: 'end', border: 0}}
        items={items}
    />
}
