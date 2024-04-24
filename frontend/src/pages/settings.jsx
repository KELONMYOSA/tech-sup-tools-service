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
                            label: 'V',
                            children: 'Поиск по "Vlan", фокус на строке поиска'
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