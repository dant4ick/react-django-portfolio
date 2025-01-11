import { useState, useMemo, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import { Row, Col, Input, Select, Flex } from "antd";
import HeaderWithBackButton from "../components/HeaderBack";
import axios from "axios";

const { Search } = Input;
const { Option } = Select;

export default function ProjectsListPage() {
    // Состояние для поиска, фильтров и сортировки
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTechnologies, setSelectedTechnologies] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortOrder, setSortOrder] = useState("newest");
    const [projects, setProjects] = useState([]);
    const [availableTechnologies, setAvailableTechnologies] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await axios.get(
                    "/api/projects/"
                );
                setProjects(response.data);

                // Extract unique technologies and tags from projects
                const techs = new Set();
                const tags = new Set();
                response.data.forEach(project => {
                    project.technologies.forEach(tech => techs.add(tech));
                    project.tags.forEach(tag => tags.add(tag));
                });
                setAvailableTechnologies([...techs]);
                setAvailableTags([...tags]);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        }

        fetchProjects();
    }, []);

    // Функция фильтрации и сортировки проектов
    const filteredProjects = useMemo(() => {
        return projects
            .filter(
                (project) =>
                    // Поиск по названию и описанию
                    (searchQuery === "" ||
                        project.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        project.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())) &&
                    // Фильтр по технологиям
                    (selectedTechnologies.length === 0 ||
                        selectedTechnologies.some((tech) =>
                            project.technologies.includes(tech)
                        )) &&
                    // Фильтр по тегам
                    (selectedTags.length === 0 ||
                        selectedTags.some((tag) => project.tags.includes(tag)))
            )
            .sort((a, b) => {
                // Сортировка по дате
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);


                return sortOrder === "newest"
                    ? dateB - dateA
                    : dateA - dateB;
            });
    }, [projects, searchQuery, selectedTechnologies, selectedTags, sortOrder]);

    return (
        <>
            <HeaderWithBackButton title="Проекты" />

            {/* Панель управления */}
            <Row gutter={[24, 16]}>
                <Col span={24}>
                    <Search
                        placeholder="Поиск проектов"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        enterButton
                    />
                </Col>

                <Col span={24}>
                    <Flex gap="small" wrap>
                        <Select
                            style={{ minWidth: "10em" }}
                            mode="multiple"
                            placeholder="Технологии"
                            value={selectedTechnologies}
                            onChange={(value) => setSelectedTechnologies(value)}
                        >
                            {availableTechnologies.map((tech) => (
                                <Option key={tech} value={tech}>
                                    {tech}
                                </Option>
                            ))}
                        </Select>

                        {/* Фильтр по тегам */}
                        <Select
                            style={{ minWidth: "10em" }}
                            mode="multiple"
                            placeholder="Теги"
                            value={selectedTags}
                            onChange={(value) => setSelectedTags(value)}
                        >
                            {availableTags.map((tag) => (
                                <Option key={tag} value={tag}>
                                    {tag}
                                </Option>
                            ))}
                        </Select>

                        {/* Сортировка */}
                        <Select
                            value={sortOrder}
                            onChange={(value) => setSortOrder(value)}
                        >
                            <Option value="newest">Сначала новые</Option>
                            <Option value="oldest">Сначала старые</Option>
                        </Select>
                    </Flex>
                </Col>
                
                {filteredProjects.map((project) => (
                    <Col key={project.id} xs={24} md={8}>
                        <ProjectCard project={project} />
                    </Col>
                ))}
            </Row>
        </>
    );
}
