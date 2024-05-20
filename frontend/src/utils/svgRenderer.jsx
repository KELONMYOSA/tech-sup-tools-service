import React, {useEffect, useState} from 'react';
import axios from 'axios';

const SvgRenderer = ({serviceDocUrl}) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const [svgContent, setSvgContent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.post(`${apiUrl}/service_docs/drawio/svg`, {
                    url: serviceDocUrl,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                let svgText = response.data;
                svgText = svgText.replace('<svg', '<svg style="width:100%;height:100%;background-color:white;"');

                setSvgContent(svgText);
            } catch (error) {
                setError(error.message);
            }
        })()
    }, [apiUrl, serviceDocUrl]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!svgContent) {
        return <div>Loading...</div>;
    }

    return (
        <div
            dangerouslySetInnerHTML={{__html: svgContent}}
            style={{width: '100%', height: '100%'}}
        />
    );
};

export default SvgRenderer;
