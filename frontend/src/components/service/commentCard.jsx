import React, {useState} from 'react';
import {Card, Descriptions, Button, Input} from 'antd';
import {EditOutlined} from "@ant-design/icons";
import axios from "axios";

const CommentCard = ({service}) => {
    const apiUrl = import.meta.env.VITE_API_URL

    const [isEditing, setIsEditing] = useState(false);
    const [techComment, setTechComment] = useState(service.supportDescription);
    const [initialTechComment, setInitialTechComment] = useState(service.supportDescription);

    const updateService = async (serviceId, descData) => {
        try {
            await axios.patch(`${apiUrl}/service/description/${serviceId}`, {
                support_desc: descData.supportDescription
            })
        } catch (error) {
        }
    };

    const toggleEdit = () => {
        if (!isEditing) {
            setInitialTechComment(techComment);
        } else {
            setTechComment(initialTechComment);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        await updateService(service.id, {supportDescription: techComment})
        setIsEditing(!isEditing)
    };

    return (
        <Card
            key={3}
            title="Примечания"
            extra={isEditing ? null : <Button onClick={toggleEdit} type={'text'}><EditOutlined/></Button>}
            style={{marginTop: 20, overflow: 'hidden'}}
        >
            <Descriptions column={1} layout='vertical'>
                <Descriptions.Item label="Менеджерское">
                    <pre style={{paddingBottom: 10, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                            {service.description || '---'}
                        </pre>
                </Descriptions.Item>
                <Descriptions.Item label="Техническое">
                    {isEditing ? (
                        <Input.TextArea
                            value={techComment}
                            onChange={e => setTechComment(e.target.value)}
                            autoSize={true}
                            showCount
                            maxLength={999}
                        />
                    ) : (
                        <pre style={{paddingBottom: 10, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                            {techComment || '---'}
                        </pre>
                    )}
                </Descriptions.Item>
            </Descriptions>
            {isEditing && (
                <div style={{marginTop: 16, textAlign: 'right'}}>
                    <Button onClick={toggleEdit} style={{marginRight: 8}}>
                        Отмена
                    </Button>
                    <Button type="primary" onClick={handleSave}>
                        Сохранить
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default CommentCard;
