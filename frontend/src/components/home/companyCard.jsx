import React, {useEffect, useState} from 'react';
import {Collapse} from 'antd';
import axios from "axios";
import checkTokenValidity from "../../utils/checkTokenValidity.js";

export default function CompanyCard(data) {
    const apiUrl = import.meta.env.VITE_API_URL

    const [isGettingData, setIsGettingData] = useState(true);
    const [items, setItems] = useState([]);

    const getCompanies = async () => {
        let tempCompanies = []
        for (const i in data.companyIds) {
            try {
                const response = await axios.get(
                    `${apiUrl}/search/company/${data.companyIds[i]}`,
                    {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}},
                );

                tempCompanies.push(response.data)
            } catch (error) {
                if (error.response.status === 401) {
                    checkTokenValidity()
                }
            }
        }
        setIsGettingData(false)
        return tempCompanies
    };

    useEffect(() => {
        (async () => {
            const companies = await getCompanies();
            setItems(companies.map(company => ({
                label: company.client,
                children: (
                    <>
                        <p><b>Клиент:</b> {company.client}</p>
                        <p><b>Торговая марка:</b> {company.brandName}</p>
                        <p><b>Тип:</b> {company.type.name}</p>
                        <p><b>Статус:</b> {company.status.name}</p>
                        <p><b>Провайдер:</b> {company.provider}</p>
                    </>
                )
            })))
        })();
    }, [data.companyIds]);

    if (isGettingData) {
        return <></>
    }

    return <Collapse items={items} defaultActiveKey={['0']} style={{marginTop: 20}}/>
}
