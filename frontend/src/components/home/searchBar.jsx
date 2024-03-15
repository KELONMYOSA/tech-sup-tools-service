import React, {useState} from 'react';
import {Input, AutoComplete} from 'antd';
import axios from 'axios';

export default function SearchBar(data) {
    const apiUrl = import.meta.env.VITE_API_URL

    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const onSearch = async value => {
        data.updateSearchText(value)
        setIsOpen(true)
        let newOptions = []
        if (value.length >= 3) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company?phone=${value}&max_results=5`
                );

                newOptions.push({
                    label: 'Телефон',
                    options: response.data.map(client => ({
                        value: `${client.company.id}_${client.phone}`,
                        label: (<p>{client.phone} - {client.company.name}</p>)
                    }))
                })
            } catch (error) {
                console.error(error)
            }
        }
        setOptions(newOptions);
    };

    const onEnter = async value => {
        if (10 <= value.length && value.length <= 11) {
            if (value.length === 11) {
                value = value.slice(1, 11)
            }
            setIsOpen(false)
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company?phone=${value}`
                );

                const ids = response.data.map(client => (client.company.id));
                data.updateCompanies(ids);
                data.updateSearchText(value);
            } catch (error) {
                console.error(error)
            }
        }
    };

    const onSelect = value => {
        const result = value.split('_')
        setIsOpen(false)
        data.updateCompanies([parseInt(result[0])]);
        data.updateSearchText(result[1]);
    };

    const onClear = () => {
        data.updateCompanies([])
        data.updateService(null)
    };

    return (
        <AutoComplete
            style={{width: '100%'}}
            open={isOpen}
            value={data.searchText}
            options={options}
            onChange={onClear}
            onSelect={onSelect}
            onSearch={onSearch}
        >
            <Input.Search
                size="large"
                placeholder="Поиск компании или услуги"
                onSearch={onEnter}
                allowClear
                enterButton
            />
        </AutoComplete>
    );
}
