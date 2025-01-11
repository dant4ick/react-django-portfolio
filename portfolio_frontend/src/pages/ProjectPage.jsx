import { useState, useEffect } from "react";
import { Flex, Row, Col, Typography, Tag, Image, Carousel } from "antd";
import ProjectCard from "../components/ProjectCard";
import HeaderWithBackButton from "../components/HeaderBack";
import LinkButton from "../components/LinkButton";
import FileButton from "../components/FileButton";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ProjectDetailsPage() {
    const { projectId } = useParams();

    const [project, setProject] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            const response = await axios.get(
                `/api/projects/${projectId}/`
            );
            setProject(response.data);
        };
        fetchProject();
    }, [projectId]);

    if (!project) {
        return <div>Loading...</div>;
    }

    const isImage = (file) => {
        const imageExtensions = ["jpg", "jpeg", "png", "gif"];
        const fileExtension = file.file.split(".").pop().toLowerCase();
        return imageExtensions.includes(fileExtension);
    };

    const screenshots = project.attached_files.filter(isImage);
    const otherFiles = project.attached_files.filter((file) => !isImage(file));

    return (
        <>
            <HeaderWithBackButton title={project.name} />

            {/* Описание проекта */}
            {project.description && (
                <>
                    <Row gutter={[24, 16]}>
                        <Col span={24}>
                            <Flex align="center" justify="space-between">
                                <Typography.Title level={3}>
                                    Описание проекта
                                </Typography.Title>
                                <Typography.Text
                                    type="secondary"
                                    style={{ textAlign: "right" }}
                                >
                                    Создан:{" "}
                                    {new Date(
                                        project.created_at
                                    ).toLocaleDateString()}
                                </Typography.Text>
                            </Flex>
                        </Col>

                        <Col span={24}>
                            <Flex>
                                {project.technologies.map((tech) => (
                                    <Tag key={tech} color="blue">
                                        {tech}
                                    </Tag>
                                ))}
                            </Flex>
                        </Col>

                        <Col span={24}>
                            <Typography.Paragraph
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {project.description}
                            </Typography.Paragraph>
                        </Col>

                        <Col span={24}>
                            <Flex>
                                {project.tags.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </Flex>
                        </Col>
                    </Row>
                </>
            )}

            {/* Скриншоты */}
            {screenshots.length > 0 && (
                <>
                    <Typography.Title level={3}>Скриншоты</Typography.Title>
                    <Carousel adaptiveHeight arrows draggable>
                        {screenshots.map((screenshot, index) => (
                            <Image
                                key={index}
                                src={screenshot.file}
                                alt={`Скриншот ${index + 1}`}
                            />
                        ))}
                    </Carousel>
                </>
            )}
            {project.links && project.links.length > 0 && (
                <>
                    <Typography.Title level={3}>
                        Ссылки на проект
                    </Typography.Title>
                    <Row gutter={[16, 16]}>
                        {project.links.map((link) => (
                            <Col key={link}>
                                <LinkButton link={link} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* Прикрепленные файлы */}
            {otherFiles.length > 0 && (
                <>
                    <Typography.Title level={3}>
                        Прикрепленные файлы
                    </Typography.Title>
                    <Row gutter={[16, 16]}>
                        {otherFiles.map(({ file: fileUrl }, index) => {
                            const fileName = decodeURIComponent(
                                fileUrl.split("/").pop()
                            );
                            return (
                                <Col key={index}>
                                    <FileButton fileUrl={fileUrl} fileName={fileName} />
                                </Col>
                            );
                        })}
                    </Row>
                </>
            )}

            {/* Похожие проекты */}
            {project.related_projects.length > 0 && (
                <>
                    <Typography.Title level={3}>
                        Похожие проекты
                    </Typography.Title>
                    <Row gutter={[16, 16]}>
                        {project.related_projects.map((relatedProject) => (
                            <Col key={relatedProject.id} xs={24} md={8}>
                                <ProjectCard project={relatedProject} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </>
    );
}
