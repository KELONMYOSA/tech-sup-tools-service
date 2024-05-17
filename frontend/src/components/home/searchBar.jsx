import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AutoComplete, Col, Input, Row} from 'antd';
import axios from 'axios';
import Highlighter from "react-highlight-words"
import SearchModeSelector from "./searchModeSelector.jsx";
import {combineResponses} from "./combineResponses.js";
import {setupShortcuts} from "../../utils/shortcuts.js";

export default function SearchBar(data) {
    const apiUrl = import.meta.env.VITE_API_URL

    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTags, setSelectedTags] = useState(['all']);
    const [searchText, setSearchText] = useState('');
    const [timer, setTimer] = useState(null);
    const shouldSearchRef = useRef(true);
    const [textChangedBySelect, setTextChangedBySelect] = useState(false);
    const searchModeSelectorRef = useRef();
    const searchModeRef = useRef(['all']);
    const inputRef = useRef();

    useEffect(() => {
        const search = data.searchParams.get('search')
        if (search) {
            searchData(search)
        }
    }, [data.searchParams])

    useEffect(() => {
        const shortcuts = [
            {
                codes: ['KeyV'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['vlan'])
                },
            },
            {
                codes: ['KeyS'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['serviceId'])
                },
            },
            {
                codes: ['KeyC'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['companyId'])
                },
            },
            {
                codes: ['KeyO'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['equipment'])
                },
            },
            {
                codes: ['KeyN'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['companyName'])
                },
            },
            {
                codes: ['KeyA'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['address'])
                },
            },
            {
                codes: ['KeyP'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['phone'])
                },
            },
            {
                codes: ['KeyK'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['contacts'])
                },
            },
            {
                codes: ['KeyD'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['doc'])
                },
            },
            {
                codes: ['KeyI'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    setSearchText(null)
                    setIsOpen(false)
                    inputRef.current.focus();
                    searchModeSelectorRef.current.setSelectedCategories(['ip'])
                },
            },
            {
                codes: ['Tab'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    searchModeSelectorRef.current.focusNextCategory();
                },
            },
            {
                codes: ['Shift+Tab'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    searchModeSelectorRef.current.focusPrevCategory();
                },
            },
            {
                codes: ['Space'],
                isActive: (activeElement) => ['input', 'textarea', 'select'].indexOf(activeElement.tagName.toLowerCase()) === -1,
                action: (activeElement) => {
                    searchModeSelectorRef.current.toggleSelectedCategory();
                },
            }
        ];
        return setupShortcuts(shortcuts);
    }, []);

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
            if (searchModeRef.current.includes('all')) {
                max_res = 10
            }

            if ((searchModeRef.current.includes('serviceId') || searchModeRef.current.includes('all')) && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/id/${value}?max_results=${max_res}`
                    );

                    newOptions.push({
                        label: 'ID Услуги',
                        options: response.data.data.map(c => ({
                            value: `serviceId_|_${c.search_value}`,
                            label: highlightText(`${c.search_value} - (${c.service_type}) ${c.company_name}`, value)
                        }))
                    })
                } catch (error) {
                }
            }

            if ((searchModeRef.current.includes('companyId') || searchModeRef.current.includes('all')) && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/id/${value}?max_results=${max_res}`
                    );

                    const childOptions = []
                    for (const [key, val] of Object.entries(response.data.stats.company_id2name)) {
                        childOptions.push(
                            {
                                value: `companyId_|_${key}`,
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

            if (searchModeRef.current.includes('ip') || searchModeRef.current.includes('all')) {
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
                                value: `ip_|_${key}`,
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

            if (searchModeRef.current.includes('companyName') || searchModeRef.current.includes('all')) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/name?name=${value}&max_results=${max_res}`
                    );

                    const childOptions = []
                    for (const [key, val] of Object.entries(response.data.stats.company_id2name)) {
                        childOptions.push(
                            {
                                value: `companyName_|_${key}&&&${val}`,
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

            if ((searchModeRef.current.includes('vlan') || searchModeRef.current.includes('all')) && !isNaN(+value)) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/vlan/${value}?max_results=${max_res}`
                    );

                    let companyVlan2Name = {}
                    response.data.data.map(c => {
                        if (c.search_value in companyVlan2Name) {
                            companyVlan2Name[c.search_value].add(c.company_name)
                        } else {
                            companyVlan2Name[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(companyVlan2Name)) {
                        childOptions.push(
                            {
                                value: `vlan_|_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Vlan',
                        options: childOptions
                    })
                } catch (error) {
                }
            }

            if (searchModeRef.current.includes('equipment') || searchModeRef.current.includes('all')) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/equipment/${value}?max_results=${max_res}`
                    );

                    let companyEquip2Name = {}
                    response.data.data.map(c => {
                        if (c.search_value in companyEquip2Name) {
                            companyEquip2Name[c.search_value].add(c.company_name)
                        } else {
                            companyEquip2Name[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(companyEquip2Name)) {
                        childOptions.push(
                            {
                                value: `equipment_|_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Оборудование',
                        options: childOptions
                    })
                } catch (error) {
                }
            }

            phoneIf: if ((searchModeRef.current.includes('phone') || searchModeRef.current.includes('all')) && !isNaN(+value)) {
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
                                value: `cPhone_|_${key}`,
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
                                value: `sPhone_|_${key}`,
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

            if (searchModeRef.current.includes('address') || searchModeRef.current.includes('all')) {
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
                                value: `cAddress_|_${val[0]}&&&${key}`,
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
                                value: `sAddress_|_${key}`,
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

            if (searchModeRef.current.includes('contacts') || searchModeRef.current.includes('all')) {
                phoneIf: if (!isNaN(+value) && searchModeRef.current.includes('contacts') && !searchModeRef.current.includes('phone')) {
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
                                    value: `cPhone_|_${key}`,
                                    label: highlightText(`${key} - ${[...val].join(', ')}`, phoneNum)
                                }
                            )
                        }

                        newOptions.push({
                            label: 'Телефон',
                            options: childOptions
                        })
                    } catch (error) {
                    }
                }

                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/email?email=${value}&max_results=${max_res}`
                    );

                    let email2Company = {}
                    response.data.data.map(c => {
                        if (c.search_value in email2Company) {
                            email2Company[c.search_value].add(c.company_name)
                        } else {
                            email2Company[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(email2Company)) {
                        childOptions.push(
                            {
                                value: `email_|_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Email',
                        options: childOptions
                    })
                } catch (error) {
                }

                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/fio?name=${value}&max_results=${max_res}`
                    );

                    let fio2Company = {}
                    response.data.data.map(c => {
                        if (c.search_value in fio2Company) {
                            fio2Company[c.search_value].add(c.company_name)
                        } else {
                            fio2Company[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(fio2Company)) {
                        childOptions.push(
                            {
                                value: `fio_|_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'ФИО',
                        options: childOptions
                    })
                } catch (error) {
                }
            }

            if (searchModeRef.current.includes('doc') || searchModeRef.current.includes('all')) {
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/service/doc?doc=${value}&max_results=${max_res}`
                    );

                    let doc2Company = {}
                    response.data.data.map(c => {
                        if (c.search_value in doc2Company) {
                            doc2Company[c.search_value].add(c.company_name)
                        } else {
                            doc2Company[c.search_value] = new Set([c.company_name])
                        }
                    })

                    const childOptions = []
                    for (const [key, val] of Object.entries(doc2Company)) {
                        childOptions.push(
                            {
                                value: `doc_|_${key}`,
                                label: highlightText(`${key} - ${[...val].join(', ')}`, value)
                            }
                        )
                    }

                    newOptions.push({
                        label: 'Договор',
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
            if (data.isMain) {
                data.updateSearchParams({search: `${searchModeRef.current}_|_${value}`})
            } else {
                window.open(`/?search=${encodeURIComponent(`${searchModeRef.current}_|_${value}`)}`, '_self')
            }
        }
    };

    const onSelect = async value => {
        if (data.isMain) {
            const curSearchValue = data.searchParams.get('search')
            if (curSearchValue === value) {
                setSearchText(value.split('_|_')[1].split('&&&')[0])
            } else {
                data.updateSearchParams({search: value})
            }
        } else {
            window.open(`/?search=${encodeURIComponent(value)}`, '_self')
        }
    };

    const searchData = async value => {
        const result = value.split('_|_')
        const selectedMods = result[0].split(',')
        const selectedValue = result[1]
        setIsOpen(false)
        setSearchText(selectedValue)
        setTextChangedBySelect(true)
        data.updateContentIsLoading(true)

        if (selectedMods.includes('cPhone') || selectedMods.includes('sPhone')) {
            searchModeRef.current = ['phone']
            searchModeSelectorRef.current.setSelectedCategories(['phone'])
        } else if (selectedMods.includes('cAddress') || selectedMods.includes('sAddress')) {
            searchModeRef.current = ['address']
            searchModeSelectorRef.current.setSelectedCategories(['address'])
        } else if (selectedMods.includes('email') || selectedMods.includes('fio')) {
            searchModeRef.current = ['contacts']
            searchModeSelectorRef.current.setSelectedCategories(['contacts'])
        } else {
            searchModeRef.current = selectedMods
            searchModeSelectorRef.current.setSelectedCategories(selectedMods)
        }

        if (timer) {
            clearTimeout(timer)
            setTimer(null)
        }
        shouldSearchRef.current = false

        const responses = []

        if (selectedMods.includes('serviceId')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/id/${selectedValue}?max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('companyId')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/id/${selectedValue}?max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('ip')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/ip?ip=${selectedValue}&max_results=10000`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('companyName')) {
            try {
                const keyVal = selectedValue.split('&&&')
                let response

                if (keyVal.length === 1) {
                    response = await axios.get(
                        `${apiUrl}/search/company/name?name=${keyVal[0]}&max_results=10000`
                    )
                } else {
                    setSearchText(keyVal[1])
                    response = await axios.get(
                        `${apiUrl}/search/company/id/${keyVal[0]}?max_results=10000`
                    )
                }

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('vlan')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/vlan/${selectedValue}?max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('equipment')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/equipment/${selectedValue}?max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        phoneIf: if (selectedMods.includes('phone')) {
            if (selectedValue.length > 11) {
                break phoneIf
            }
            let phoneNum = selectedValue
            if (selectedValue.length === 11) {
                phoneNum = phoneNum.slice(1)
            }
            try {
                const response = await axios.get(
                    `${apiUrl}/search/phone?phone=${phoneNum}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        cPhoneIf: if (selectedMods.includes('cPhone')) {
            if (selectedValue.length > 11) {
                break cPhoneIf
            }
            let phoneNum = selectedValue
            if (selectedValue.length === 11) {
                phoneNum = phoneNum.slice(1)
            }
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/phone?phone=${phoneNum}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        sPhoneIf: if (selectedMods.includes('sPhone')) {
            if (selectedValue.length > 11) {
                break sPhoneIf
            }
            let phoneNum = selectedValue
            if (selectedValue.length === 11) {
                phoneNum = phoneNum.slice(1)
            }
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/phone?phone=${phoneNum}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('address')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/address?address=${selectedValue}&max_results=10000`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('cAddress')) {
            try {
                const keyVal = selectedValue.split('&&&')
                setSearchText(keyVal[1])
                const response = await axios.get(
                    `${apiUrl}/search/company/id/${keyVal[0]}?max_results=10000`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('sAddress')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/address?address=${selectedValue}&max_results=10000`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('contacts')) {
            cPhoneIf: if (!isNaN(+selectedValue) && !searchModeRef.current.includes('phone')) {
                if (selectedValue.length > 11) {
                    break cPhoneIf
                }
                let phoneNum = selectedValue
                if (selectedValue.length === 11) {
                    phoneNum = phoneNum.slice(1)
                }
                try {
                    const response = await axios.get(
                        `${apiUrl}/search/company/phone?phone=${phoneNum}&max_results=10000&exact_match=true`
                    );

                    responses.push(response.data)
                } catch (error) {
                }
            }

            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/email?email=${selectedValue}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }

            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/fio?name=${selectedValue}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('email')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/email?email=${selectedValue}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('fio')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/fio?name=${selectedValue}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('doc')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/service/doc?doc=${selectedValue}&max_results=10000&exact_match=true`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        if (selectedMods.includes('all')) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/all?text=${selectedValue}&max_results=10000`
                );

                responses.push(response.data)
            } catch (error) {
            }
        }

        data.updateServicesData(combineResponses(responses))
        data.updateContentIsLoading(false)
    }

    const debounceSearch = useCallback((value) => {
        if (timer) {
            clearTimeout(timer);
        }

        let timeout = 750
        if (searchModeRef.current === ['all']) {
            timeout = 1000
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
            data.updateSearchParams((params) => {
                params.delete('search')
                return params
            })
            data.updateServicesData(null)
            setIsOpen(false)
        }
    };

    useEffect(() => {
        searchModeRef.current = selectedTags;
    }, [selectedTags]);

    const searchMods = [
        {
            label: 'Везде',
            key: 'all',
            selected: true,
        },
        {
            label: 'ID Услуги',
            key: 'serviceId',
            selected: false,
        },
        {
            label: 'ID Компании',
            key: 'companyId',
            selected: false,
        },
        {
            label: 'IP',
            key: 'ip',
            selected: false,
        },
        {
            label: 'Vlan',
            key: 'vlan',
            selected: false,
        },
        {
            label: 'Оборудование',
            key: 'equipment',
            selected: false,
        },
        {
            label: 'Название компании',
            key: 'companyName',
            selected: false,
        },
        {
            label: 'Адрес',
            key: 'address',
            selected: false,
        },
        {
            label: 'Телефон',
            key: 'phone',
            selected: false,
        },
        {
            label: 'Контакты',
            key: 'contacts',
            selected: false,
        },
        {
            label: 'Договор',
            key: 'doc',
            selected: false,
        },
    ]

    return (
        <Row style={{height: '100%', width: '100%'}}>
            <Col flex='auto' style={{alignContent: 'center'}}>
                <AutoComplete
                    style={{width: '100%'}}
                    open={isOpen}
                    value={searchText}
                    options={options}
                    onChange={onChange}
                    onSelect={onSelect}
                >
                    <Input.Search
                        style={{marginTop: -10, paddingLeft: 10, paddingRight: 10, width: '100%'}}
                        size="large"
                        placeholder='Поиск компании или услуги'
                        onSearch={onEnter}
                        allowClear
                        loading={isLoading}
                        enterButton
                        ref={inputRef}
                    />
                </AutoComplete>
            </Col>
            <Col style={{alignSelf: 'center'}}>
                <SearchModeSelector ref={searchModeSelectorRef} initialCategories={searchMods} onChange={setSelectedTags}/>
            </Col>
        </Row>
    );
}
