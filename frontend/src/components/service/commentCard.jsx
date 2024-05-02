import React, {useState} from 'react';
import {Card, Descriptions, Button, Input, message} from 'antd';
import {EditOutlined} from "@ant-design/icons";
import axios from "axios";

const CommentCard = ({service}) => {
    const apiUrl = import.meta.env.VITE_API_URL

    const [isEditing, setIsEditing] = useState(false);
    const [managerComment, setManagerComment] = useState(service.description);
    const [techComment, setTechComment] = useState(service.supportDescription);
    const [initialManagerComment, setInitialManagerComment] = useState(service.description);
    const [initialTechComment, setInitialTechComment] = useState(service.supportDescription);

    const updateService = async (serviceId, descData) => {
        try {
            const response = await axios.put(`${apiUrl}/service/description/${serviceId}`, {
                desc: descData.description,
                support_desc: descData.supportDescription
            });
            console.log(response.data)
        } catch (error) {
        }
    };

    const toggleEdit = () => {
        if (!isEditing) {
            setInitialManagerComment(managerComment);
            setInitialTechComment(techComment);
        } else {
            setManagerComment(initialManagerComment);
            setTechComment(initialTechComment);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        await updateService(service.id, {description: managerComment, supportDescription: techComment})
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
                    {isEditing ? (
                        <Input.TextArea
                            value={managerComment}
                            onChange={e => setManagerComment(e.target.value)}
                            autoSize={true}
                            showCount
                            maxLength={999}
                        />
                    ) : (
                        <pre style={{paddingBottom: 10, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                            {managerComment || '---'}
                        </pre>
                    )}
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
