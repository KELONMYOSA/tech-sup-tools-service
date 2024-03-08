import React, {useState} from 'react';
import {Input, AutoComplete} from 'antd';
import axios from 'axios';
import checkTokenValidity from "../../utils/checkTokenValidity.js";

export default function SearchClientByPhoneNumber(data) {
    const apiUrl = import.meta.env.VITE_API_URL

    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const onSearch = async value => {
        data.updatePhone(value)
        setIsOpen(true)
        if (value.length >= 2 && value.length <= 10) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/client?phone=${value}`,
                    {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}},
                );

                const newOptions = response.data.map(client => ({
                    value: `${client.company.id}_${client.phone}`,
                    label: `${client.company.name} - ${client.contact.name}`
                }));

                setOptions(newOptions);
            } catch (error) {
                if (error.response.status === 401) {
                    checkTokenValidity()
                }
                setOptions([]);
            }
        } else {
            setOptions([]);
        }
    };

    const onEnter = async value => {
        if (value.length === 10) {
            setIsOpen(false)
            try {
                const response = await axios.get(
                    `${apiUrl}/search/client?phone=${value}`,
                    {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}},
                );

                const ids = response.data.map(client => (client.company.id));
                data.updateCompanies(ids);
                data.updatePhone(value);
            } catch (error) {
                if (error.response.status === 401) {
                    checkTokenValidity()
                }
            }
        }
    };

    const onSelect = value => {
        const result = value.split('_')
        setIsOpen(false)
        data.updateCompanies([parseInt(result[0])]);
        data.updatePhone(result[1]);
    };

    const onClear = () => {
        data.updateCompanies([])
    };

    return (
        <AutoComplete
            style={{width: '100%'}}
            open={isOpen}
            value={data.phone}
            options={options}
            onChange={onClear}
            onSelect={onSelect}
            onSearch={onSearch}
        >
            <Input.Search
                size="large"
                placeholder="Номер телефона"
                onSearch={onEnter}
                allowClear
                enterButton
            />
        </AutoComplete>
    );
}
