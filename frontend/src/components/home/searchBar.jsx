import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Input, AutoComplete, Dropdown} from 'antd';
import axios from 'axios';
import {SearchOutlined} from "@ant-design/icons";
import styles from '../../index.module.less'
import Highlighter from "react-highlight-words"

export default function SearchBar(data) {
    const apiUrl = import.meta.env.VITE_API_URL

    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchMode, setSearchMode] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [timer, setTimer] = useState(null);
    const shouldSearchRef = useRef(true);
    const [textChangedBySelect, setTextChangedBySelect] = useState(false);

    const highlightText = (text, searchText) => {
        return (
            <Highlighter
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text}
            />
        )
    }

    const onSearch = async (value) => {
        setIsLoading(true)
        let newOptions = []
        if (value.length > 0) {
            let max_res = 100
            if (searchMode === 'all') {
                max_res = 10
            }

            if (['all', 'serviceId'].includes(searchMode) && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/id/${value}?max_results=${max_res}`
                    );

                    newOptions.push({
                        label: 'ID Услуги',
                        options: response.data.data.map(c => ({
                            value: `serviceId_${c.search_value}`,
                            label: highlightText(`${c.search_value} - (${c.service_type}) ${c.company_name}`, value)
                        }))
                    })
                } catch (error) {
                }
            }

            if (['all', 'companyId'].includes(searchMode) && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/id/${value}?max_results=${max_res}`
                    );

                    const childOptions = []
                    for (const [key, val] of Object.entries(response.data.stats.company_id2name)) {
                        childOptions.push(
                            {
                                value: `companyId_${key}`,
                                label: highlightText(`${key} - ${val}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'ID Компании',
                        options: childOptions
                    })
                } catch (error) {
                }
            }

            if (['all', 'ip'].includes(searchMode)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/ip?ip=${value}&max_results=${max_res}`
                    );

                    let companyIp2Name = {}
                    response.data.data.map(c => {
                        if (c.search_value in companyIp2Name) {
                            companyIp2Name[c.search_value].add(c.company_name)
                        } else {
                            companyIp2Name[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(companyIp2Name)) {
                        childOptions.push(
                            {
                                value: `ip_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'IP',
                        options: childOptions
                    })
                } catch (error) {
                }
            }

            if (['all', 'companyName'].includes(searchMode)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/name?name=${value}&max_results=${max_res}`
                    );

                    const childOptions = []
                    for (const [key, val] of Object.entries(response.data.stats.company_id2name)) {
                        childOptions.push(
                            {
                                value: `companyName_${key}`,
                                label: highlightText(val, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Название компании',
                        options: childOptions
                    })
                } catch (error) {
                }
            }

            phoneIf: if (['all', 'phone'].includes(searchMode) && !isNaN(+value)) {
                if (value.length > 11) {
                    break phoneIf
                }
                let phoneNum = value
                if (value.length === 11) {
                    phoneNum = phoneNum.slice(1)
                }

                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/phone?phone=${phoneNum}&max_results=${max_res}`
                    );

                    let companyPhone2Name = {}
                    response.data.data.map(c => {
                        if (c.search_value in companyPhone2Name) {
                            companyPhone2Name[c.search_value].add(c.company_name)
                        } else {
                            companyPhone2Name[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(companyPhone2Name)) {
                        childOptions.push(
                            {
                                value: `cPhone_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, phoneNum)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Телефон - Компания',
                        options: childOptions
                    })
                } catch (error) {
                }

                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/phone?phone=${phoneNum}&max_results=${max_res}`
                    );

                    let companyPhone2Name = {}
                    response.data.data.map(c => {
                        if (c.search_value in companyPhone2Name) {
                            companyPhone2Name[c.search_value].add(c.company_name)
                        } else {
                            companyPhone2Name[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(companyPhone2Name)) {
                        childOptions.push(
                            {
                                value: `sPhone_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, phoneNum)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Телефон - Услуга',
                        options: childOptions
                    })
                } catch (error) {
                }
            }

            if (['all', 'address'].includes(searchMode)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/address?address=${value}&max_results=${max_res}`
                    );

                    let companyAddress2Name = {}
                    response.data.data.map(c => {
                        if (c.search_value in companyAddress2Name) {
                            companyAddress2Name[c.search_value][1].add(c.company_name)
                        } else {
                            companyAddress2Name[c.search_value] = [c.company_id, new Set([c.company_name])]
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(companyAddress2Name)) {
                        childOptions.push(
                            {
                                value: `cAddress_${val[0]}&&&${key}`,
                                label: highlightText(`${key} - ${[...val[1]].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Адрес - Компания',
                        options: childOptions
                    })
                } catch (error) {
                }

                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/address?address=${value}&max_results=${max_res}`
                    );

                    let companyAddress2Name = {}
                    response.data.data.map(c => {
                        if (c.search_value in companyAddress2Name) {
                            companyAddress2Name[c.search_value].add(c.company_name)
                        } else {
                            companyAddress2Name[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(companyAddress2Name)) {
                        childOptions.push(
                            {
                                value: `sAddress_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Адрес - Услуга',
                        options: childOptions
                    })
                } catch (error) {
                }
            }
        }
        setIsLoading(false)
        setIsOpen(true)
        setOptions(newOptions)
    };

    const onEnter = async value => {
        if (value.length > 0) {
            setIsOpen(false)
            setTextChangedBySelect(true)
            data.updateContentIsLoading(true)

            if (timer) {
                clearTimeout(timer)
                setTimer(null)
            }
            shouldSearchRef.current = false

            if (searchMode === 'serviceId' && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/id/${value}?max_results=10000`
                    );

                    data.updateServicesData(response.data)
                } catch (error) {
                }
            }

            if (searchMode === 'companyId' && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/id/${value}?max_results=10000`
                    );

                    data.updateServicesData(response.data)
                } catch (error) {
                }
            }

            if (searchMode === 'ip') {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/ip?ip=${value}&max_results=10000`
                    );

                    data.updateServicesData(response.data)
                } catch (error) {
                }
            }

            if (searchMode === 'companyName') {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/name?name=${value}&max_results=10000`
                    );

                    data.updateServicesData(response.data)
                } catch (error) {
                }
            }

            if (searchMode === 'phone' && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/phone?phone=${value}&max_results=10000`
                    );

                    data.updateServicesData(response.data)
                } catch (error) {
                }
            }

            if (searchMode === 'address') {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/address?address=${value}&max_results=10000`
                    );

                    data.updateServicesData(response.data)
                } catch (error) {
                }
            }

            if (searchMode === 'all') {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/all?text=${value}&max_results=10000`
                    );

                    data.updateServicesData(response.data)
                } catch (error) {
                }
            }

            data.updateContentIsLoading(false)
        }
    };

    const onSelect = async value => {
        const result = value.split('_')
        setIsOpen(false)
        setSearchText(result[1])
        setTextChangedBySelect(true)
        data.updateContentIsLoading(true)

        if (timer) {
            clearTimeout(timer)
            setTimer(null)
        }
        shouldSearchRef.current = false

        if (result[0] === 'serviceId') {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/id/${result[1]}?max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        if (result[0] === 'companyId') {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/id/${result[1]}?max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        if (result[0] === 'ip') {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/ip?ip=${result[1]}&max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        if (result[0] === 'companyName') {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/id/${result[1]}?max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        if (result[0] === 'cPhone') {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/phone?phone=${result[1]}&max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        if (result[0] === 'sPhone') {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/phone?phone=${result[1]}&max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        if (result[0] === 'cAddress') {
            try {
                const company_id = result[1].split('&&&')[0]
                setSearchText(company_id)
                const response = await axios.get(
                    `${apiUrl}/search/company/id/${company_id}?max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        if (result[0] === 'sAddress') {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/address?address=${result[1]}&max_results=10000`
                );

                data.updateServicesData(response.data)
            } catch (error) {
            }
        }

        data.updateContentIsLoading(false)
    };

    const debounceSearch = useCallback((value) => {
        if (timer) {
            clearTimeout(timer);
        }

        let timeout = 750
        if (searchMode === 'all') {
            timeout = 1500
        }

        const newTimer = setTimeout(() => {
            if (shouldSearchRef.current) {
                onSearch(value);
            }
        }, timeout);

        setTimer(newTimer);
    }, [timer]);

    useEffect(() => {
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [timer]);

    const onChange = (value) => {
        setSearchText(value)
        if (!textChangedBySelect) {
            debounceSearch(value);
        }
        setTextChangedBySelect(false);
        shouldSearchRef.current = true
        if (value.length === 0) {
            data.updateServicesData(null)
            setIsOpen(false)
        }
    };

    const onSearchModeClick = (e) => {
        setSearchMode(e.key)
    };

    const searchMods = [
        {
            label: 'Везде',
            key: 'all',
        },
        {
            label: 'ID Услуги',
            key: 'serviceId',
        },
        {
            label: 'ID Компании',
            key: 'companyId',
        },
        {
            label: 'IP',
            key: 'ip',
        },
        {
            label: 'Название компании',
            key: 'companyName',
        },
        {
            label: 'Адрес',
            key: 'address',
        },
        {
            label: 'Номер телефона',
            key: 'phone',
        },
    ]

    const searchMode2Text = {
        all: 'Поиск компании или услуги',
        serviceId: 'Поиск: ID Услуги',
        companyId: 'Поиск: ID Компании',
        ip: 'Поиск: IP',
        companyName: 'Поиск: Название компании',
        address: 'Поиск: Адрес улуги или компании',
        phone: 'Поиск: Номер телефона'
    }

    return (
        <AutoComplete
            style={{width: '100%'}}
            open={isOpen}
            value={searchText}
            options={options}
            onChange={onChange}
            onSelect={onSelect}
        >
            <Input.Search
                size="large"
                placeholder={searchMode2Text[searchMode]}
                onSearch={onEnter}
                allowClear
                enterButton={
                    <Dropdown.Button
                        menu={{
                            items: searchMods,
                            onClick: onSearchModeClick,
                        }}
                        type='primary'
                        loading={isLoading}
                        rootClassName={styles.custom_search_button}
                    >
                        <SearchOutlined/>
                    </Dropdown.Button>
                }
            />
        </AutoComplete>
    );
}
