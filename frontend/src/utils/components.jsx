import React from 'react';
import {Button, message} from 'antd';

const CopyToClipboardButton = ({text, item, style, type}) => {
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success('Текст скопирован в буфер обмена!');
        } catch (err) {
            message.error('Ошибка при копировании текста');
        }
    };

    return (
        <Button
            type={type}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...style,
            }}
            onClick={() => copyToClipboard(text)}
        >
            {item}
        </Button>
    );
};

export default CopyToClipboardButton;
