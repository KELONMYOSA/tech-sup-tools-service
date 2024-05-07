import React, {useState} from 'react';
import {Descriptions, Button, Row, Col, Flex, Input} from 'antd';
import {EditOutlined, PlusOutlined} from "@ant-design/icons";
import axios from "axios";

const ServiceLinksCard = ({service}) => {
    const apiUrl = import.meta.env.VITE_API_URL

    const [isEditingWiki, setIsEditingWiki] = useState(false);
    const [isEditingCloud, setIsEditingCloud] = useState(false);
    const [wikiLink, setWikiLink] = useState(service.serviceDocs.links.wiki);
    const [cloudLink, setCloudLink] = useState(service.serviceDocs.links.cloud);
    const [initialWikiLink, setInitialWikiLink] = useState(service.serviceDocs.links.wiki);
    const [initialCloudLink, setInitialCloudLink] = useState(service.serviceDocs.links.cloud);

    const updateService = async (serviceId, linkData) => {
        try {
            await axios.patch(`${apiUrl}/service/document/link/${serviceId}`, {
                doc_type_id: linkData.docTypeId,
                link: linkData.link
            })
        } catch (error) {
        }
    };

    const toggleEditWiki = () => {
        if (!isEditingWiki) {
            setInitialWikiLink(wikiLink);
        } else {
            setWikiLink(initialWikiLink);
        }
        setIsEditingWiki(!isEditingWiki);
    };

    const toggleEditCloud = () => {
        if (!isEditingCloud) {
            setInitialCloudLink(cloudLink);
        } else {
            setCloudLink(initialCloudLink);
        }
        setIsEditingCloud(!isEditingCloud);
    };

    const handleSave = async (linkType) => {
        if (linkType === 'wiki') {
            await updateService(service.id, {docTypeId: 11736, link: wikiLink})
            setIsEditingWiki(!isEditingWiki)
        } else {
            await updateService(service.id, {docTypeId: 11737, link: cloudLink})
            setIsEditingCloud(!isEditingCloud)
        }
    };

    return (
        <Descriptions
            size='small'
            bordered
            style={{marginBottom: 10}}
            column={1}
            labelStyle={{width: '150px'}}
            items={[
                {
                    label: 'Ссылка на Wiki',
                    children:
                        <Row justify={'space-between'} wrap={false}>
                            <Col flex='auto'>
                                {isEditingWiki ? (
                                    <Input
                                        value={wikiLink}
                                        onChange={e => setWikiLink(e.target.value)}
                                        showCount
                                        maxLength={102}
                                    />
                                ) : (
                                    <a href={wikiLink} target={'_blank'}>{wikiLink}</a>
                                )}
                            </Col>
                            <Col flex={isEditingWiki ? '170px' : '50px'}>
                                <Flex justify='flex-end' align='center' style={{height: '100%'}}>
                                    {isEditingWiki ? (
                                        <>
                                            <Button onClick={toggleEditWiki} size='small' style={{marginRight: 8}}>
                                                Отмена
                                            </Button>
                                            <Button type='primary' size='small' onClick={() => handleSave('wiki')}>
                                                Сохранить
                                            </Button>
                                        </>
                                    ) : (
                                        <Button size={'small'} type={'text'} onClick={toggleEditWiki}>
                                            {wikiLink ? <EditOutlined/> : <PlusOutlined/>}
                                        </Button>
                                    )}
                                </Flex>
                            </Col>
                        </Row>
                },
                {
                    label: 'Ссылка на Cloud',
                    children:
                        <Row justify={'space-between'} wrap={false}>
                            <Col flex='auto'>
                                {isEditingCloud ? (
                                    <Input
                                        value={cloudLink}
                                        onChange={e => setCloudLink(e.target.value)}
                                        showCount
                                        maxLength={102}
                                    />
                                ) : (
                                    <a href={cloudLink} target={'_blank'}>{cloudLink}</a>
                                )}
                            </Col>
                            <Col flex={isEditingCloud ? '170px' : '50px'}>
                                <Flex justify='flex-end' align='center' style={{height: '100%'}}>
                                    {isEditingCloud ? (
                                        <>
                                            <Button onClick={toggleEditCloud} size='small' style={{marginRight: 8}}>
                                                Отмена
                                            </Button>
                                            <Button type='primary' size='small' onClick={() => handleSave('cloud')}>
                                                Сохранить
                                            </Button>
                                        </>
                                    ) : (
                                        <Button size={'small'} type={'text'} onClick={toggleEditCloud}>
                                            {cloudLink ? <EditOutlined/> : <PlusOutlined/>}
                                        </Button>
                                    )}
                                </Flex>
                            </Col>
                        </Row>
                },
            ]}
        />
    );
};

export default ServiceLinksCard;
