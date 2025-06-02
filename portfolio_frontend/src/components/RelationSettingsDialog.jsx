import { useState, useEffect } from "react";
import { Modal, Checkbox, Divider, Typography, message, Button, Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import { getToken } from "../services/auth";

const { Title, Text } = Typography;

export default function RelationSettingsDialog({ isOpen, setIsOpen, onUnauthorized }) {
    const [loading, setLoading] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [allTechnologies, setAllTechnologies] = useState([]);
    const [excludedTags, setExcludedTags] = useState([]);
    const [excludedTechnologies, setExcludedTechnologies] = useState([]);

    // Fetch current settings and available options
    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = getToken();
            if (!token) {
                onUnauthorized();
                return;
            }

            // Fetch current relation settings
            const settingsResponse = await axios.get("/api/relation-settings/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setExcludedTags(settingsResponse.data.excluded_tags || []);
            setExcludedTechnologies(settingsResponse.data.excluded_technologies || []);

            // Fetch all available technologies
            const techResponse = await axios.get("/api/technologies/");
            setAllTechnologies(techResponse.data);

            // Fetch all projects to extract unique tags
            const projectsResponse = await axios.get("/api/projects/");
            const uniqueTags = new Set();
            projectsResponse.data.forEach(project => {
                if (project.tags) {
                    project.tags.forEach(tag => uniqueTags.add(tag));
                }
            });
            setAllTags([...uniqueTags].sort());

        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response?.status === 401) {
                onUnauthorized();
            } else {
                message.error("Ошибка при загрузке данных");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = getToken();
            if (!token) {
                onUnauthorized();
                return;
            }

            await axios.put("/api/relation-settings/", {
                excluded_tags: excludedTags,
                excluded_technologies: excludedTechnologies
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            message.success("Настройки успешно сохранены!");
            setIsOpen(false);
        } catch (error) {
            console.error("Error saving settings:", error);
            if (error.response?.status === 401) {
                onUnauthorized();
            } else {
                message.error("Ошибка при сохранении настроек");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTagChange = (tag, checked) => {
        if (checked) {
            setExcludedTags([...excludedTags, tag]);
        } else {
            setExcludedTags(excludedTags.filter(t => t !== tag));
        }
    };

    const handleTechnologyChange = (tech, checked) => {
        if (checked) {
            setExcludedTechnologies([...excludedTechnologies, tech]);
        } else {
            setExcludedTechnologies(excludedTechnologies.filter(t => t !== tech));
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <SettingOutlined />
                    Настройки связи проектов
                </Space>
            }
            open={isOpen}
            onCancel={() => setIsOpen(false)}
            onOk={handleSave}
            okText="Сохранить"
            cancelText="Отмена"
            confirmLoading={loading}
            width={700}
            bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
            getContainer={false}
        >
            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                    Выберите теги и технологии, которые следует исключить из расчета похожести проектов.
                    Проекты с только исключенными тегами/технологиями не будут показаны как похожие.
                </Text>
            </div>

            <Title level={4}>Исключить теги из расчета похожести</Title>
            <div style={{ marginBottom: 24, maxHeight: "150px", overflowY: "auto" }}>
                {allTags.length === 0 ? (
                    <Text type="secondary">Теги не найдены</Text>
                ) : (
                    <Checkbox.Group
                        value={excludedTags}
                        style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                    >
                        {allTags.map(tag => (
                            <Checkbox 
                                key={tag} 
                                value={tag}
                                onChange={(e) => handleTagChange(tag, e.target.checked)}
                            >
                                {tag}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                )}
            </div>

            <Divider />

            <Title level={4}>Исключить технологии из расчета похожести</Title>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                {allTechnologies.length === 0 ? (
                    <Text type="secondary">Технологии не найдены</Text>
                ) : (
                    <Checkbox.Group
                        value={excludedTechnologies}
                        style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                    >
                        {allTechnologies.map(tech => (
                            <Checkbox 
                                key={tech} 
                                value={tech}
                                onChange={(e) => handleTechnologyChange(tech, e.target.checked)}
                            >
                                {tech}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                )}
            </div>

            {(excludedTags.length > 0 || excludedTechnologies.length > 0) && (
                <>
                    <Divider />
                    <div>
                        <Text strong>Текущие исключения:</Text>
                        {excludedTags.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">Теги: </Text>
                                <Text code>{excludedTags.join(", ")}</Text>
                            </div>
                        )}
                        {excludedTechnologies.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">Технологии: </Text>
                                <Text code>{excludedTechnologies.join(", ")}</Text>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
}
