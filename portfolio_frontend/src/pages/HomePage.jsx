import { useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import { Link as DomLink } from "react-router-dom";
import {
    NodejsPlain,
    TypescriptOriginal,
    PythonOriginal,
    DjangoPlain,
    PostgresqlOriginal,
    FirebaseOriginal,
    ReactOriginal,
    FlutterOriginal,
    COriginal,
    JavascriptOriginal,
    GodotOriginal,
} from "devicons-react";
import { Button, Space, Typography, Input, Row, Col, Flex, Card } from "antd";
import axios from "axios";
import { CodeOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const iconMap = {
    "React": <ReactOriginal size={32} />,
    "Node.js": <NodejsPlain size={32} />,
    "TypeScript": <TypescriptOriginal size={32} />,
    "Python": <PythonOriginal size={32} />,
    "Django": <DjangoPlain size={32} />,
    "PostgreSQL": <PostgresqlOriginal size={32} />,
    "Firebase": <FirebaseOriginal size={32} />,
    "Flutter": <FlutterOriginal size={32} />,
    "C": <COriginal size={32} />,
    "JavaScript": <JavascriptOriginal size={32} />,
    "GDScript": <GodotOriginal size={32} />,
};

const placeholderIcon = <CodeOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />;

export default function PortfolioHomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [technologies, setTechnologies] = useState([]);

    useEffect(() => {
        axios.get('/api/projects?is_starred=true')
            .then(response => {
                setFeaturedProjects(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the projects!", error);
            });

        axios.get('/api/technologies/')
            .then(response => {
                setTechnologies(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the technologies!", error);
            });
    }, []);

    const filteredProjects = featuredProjects.filter(
        (project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.short_description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            project.technologies.some((tech) =>
                tech.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    return (
        <Flex gap="large" vertical>
            {/* Hero Section */}
            <Flex vertical align="center" gap="middle">
                <Title level={2}>Добро пожаловать в мое портфолио!</Title>
                <Text type="secondary" strong>
                    Здесь вы найдете мои проекты, технологии и профессиональный
                    опыт
                </Text>
                <Button type="primary" shape="round" size="large">
                    <DomLink to="/projects">Посмотреть проекты</DomLink>
                </Button>
            </Flex>

            {/* Technologies Section */}
            <Space direction="vertical" size="large">
                <Title level={3}>Мои технологии</Title>
                <Row justify="center" gutter={[32, 32]}>
                    {technologies.map((tech) => (
                        <Col key={tech}>
                            <Card size="small">
                                <Flex vertical align="center" gap="small">
                                    {iconMap[tech] || placeholderIcon}
                                    <Text strong>{tech}</Text>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Space>

            {/* Featured Projects Section */}
            {featuredProjects.length > 0 && (
                <Space direction="vertical" size="large">
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[24, 16]}
                        style={{ marginBottom: "24px" }}
                    >
                        <Col>
                            <h3
                                style={{ fontSize: "24px", fontWeight: "bold" }}
                            >
                                Избранные проекты
                            </h3>
                        </Col>
                        <Col>
                            <Row gutter={[8, 8]}>
                                <Col>
                                    <Input
                                        placeholder="Поиск проектов"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </Col>
                                <Col>
                                    <Button icon={<SearchOutlined />} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={[24, 16]}>
                        {filteredProjects.map((project) => (
                            <Col key={project.name} xs={24} sm={12} md={8}>
                                <ProjectCard project={project} />
                            </Col>
                        ))}
                    </Row>
                </Space>
            )}
        </Flex>
    );
}
