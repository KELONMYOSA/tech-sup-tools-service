import React, {useState} from 'react';
import {Input, AutoComplete} from 'antd';
import axios from 'axios';

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
                    `${apiUrl}/search/client?phone=${value}`
                );

                const newOptions = response.data.map(client => ({
                    value: `${client.company.id}_${client.phone}`,
                    label: (<p><b>{client.company.name}</b> - {client.contact.name}</p>)
                }));

                setOptions(newOptions);
            } catch (error) {
                console.error(error)
                setOptions([]);
            }
        } else {
            setOptions([]);
        }
    };

    const onEnter = async value => {
        if (10 <= value.length && value.length <= 11) {
            if (value.length === 11) {
                value = value.slice(1, 11)
            }
            setIsOpen(false)
            try {
                const response = await axios.get(
                    `${apiUrl}/search/client?phone=${value}`
                );

                const ids = response.data.map(client => (client.company.id));
                data.updateCompanies(ids);
                data.updatePhone(value);
            } catch (error) {
                console.error(error)
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
            onKeyDown={(event) => {
                if (!/[0-9]/.test(event.key) && !['Delete', 'Backspace', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    event.preventDefault();
                }
            }}
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
