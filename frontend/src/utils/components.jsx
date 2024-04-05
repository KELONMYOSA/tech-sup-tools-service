import React from 'react';
import {Button, message} from 'antd';

const CopyToClipboardButton = ({text, item, style, type}) => {
    const [messageApi, contextHolder] = message.useMessage();

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            messageApi.open({
                type: 'success',
                content: 'Текст скопирован в буфер обмена!',
            });
        } catch (err) {
            messageApi.open({
                type: 'error',
                content: 'Ошибка при копировании текста',
            });
        }
    };

    return (
        <>
            {contextHolder}
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
        </>
    );
};

export default CopyToClipboardButton;
