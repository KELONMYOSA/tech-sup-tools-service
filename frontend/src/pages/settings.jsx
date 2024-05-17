import {Col, Row, Radio, Descriptions} from "antd";
import React, {useState} from "react";
import PageTemplate from "../components/pageTemplate.jsx";
import {useThemeMode} from "antd-style";

export default function Settings(data) {
    const [headerHeight, setHeaderHeight] = useState('64px');

    const { themeMode, setThemeMode } = useThemeMode();
    const themeOptions = [
        { label: 'Авто', value: 'auto' },
        { label: 'Светлая', value: 'light' },
        { label: 'Темная', value: 'dark' },
    ];
    const changeTheme = (v) => {
        const val = v.target.value
        setThemeMode(val)
        localStorage.setItem('theme', val)
    }

    const pageContent = (
        <Row>
            <Col xs={24} md={12} style={{padding: 20}}>
                <Descriptions
                    column={1}
                    labelStyle={{alignSelf: 'center', marginRight: 20}}
                    title="Настройки"
                    items={[
                        {
                            label: 'Тема',
                            children: <Radio.Group options={themeOptions} onChange={changeTheme} value={themeMode} optionType="button" />
                        },
                    ]}
                />
            </Col>
            <Col xs={24} md={12} style={{padding: 20}}>
                <Descriptions
                    column={1}
                    bordered
                    title="Шорткаты"
                    items={[
                        {
                            label: 'S',
                            children: 'Поиск по "ID Услуги", фокус на строке поиска'
                        },
                        {
                            label: 'C',
                            children: 'Поиск по "ID Компании", фокус на строке поиска'
                        },
                        {
                            label: 'I',
                            children: 'Поиск по "IP", фокус на строке поиска'
                        },
                        {
                            label: 'V',
                            children: 'Поиск по "Vlan", фокус на строке поиска'
                        },
                        {
                            label: 'O',
                            children: 'Поиск по "Оборудованию", фокус на строке поиска'
                        },
                        {
                            label: 'N',
                            children: 'Поиск по "Названию компании", фокус на строке поиска'
                        },
                        {
                            label: 'A',
                            children: 'Поиск по "Адресу", фокус на строке поиска'
                        },
                        {
                            label: 'P',
                            children: 'Поиск по "Телефону", фокус на строке поиска'
                        },
                        {
                            label: 'K',
                            children: 'Поиск по "Контактам", фокус на строке поиска'
                        },
                        {
                            label: 'D',
                            children: 'Поиск по "Договору", фокус на строке поиска'
                        },
                        {
                            label: 'Tab',
                            children: 'Фокус на следующей категории поиска'
                        },
                        {
                            label: 'Shift + Tab',
                            children: 'Фокус на предыдущей категории поиска'
                        },
                        {
                            label: 'Space',
                            children: 'Выбор категории, на которой фокус'
                        },
                    ]}
                />
            </Col>
        </Row>
    )

    return <PageTemplate
        isMain={false}
        searchBarEnabled={false}
        userData={data.userData}
        content={pageContent}
        headerHeight={headerHeight}
        setHeaderHeight={setHeaderHeight}
    />
}