import PropTypes from "prop-types";
import { Card, Flex, Typography, Tag, Space, Tooltip } from "antd";
import { Link } from "react-router-dom";
import LinkButton from "./LinkButton";
import { CalendarOutlined, StarFilled, RightOutlined } from "@ant-design/icons"; // Add this import

const { Text, Paragraph } = Typography;

export default function ProjectCard({ project }) {
    const cardTitle = (
        <Tooltip title="Нажмите, чтобы перейти на страницу проекта">
            <Link to={`/projects/${project.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                <RightOutlined style={{ marginRight: 8 }} />
                <Text strong>
                    {project.name || "Без названия"}
                </Text>
            </Link>
        </Tooltip>
    );

    return (
        <Card title={cardTitle} size="small" hoverable>
            <Flex gap="middle" vertical>
                {project.description && (
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                        {project.description}
                    </Paragraph>
                )}

                {project.technologies?.length > 0 && (
                    <Flex gap="small" wrap>
                        {project.technologies.map((tech) => (
                            <Tag key={tech} color="processing">
                                {tech}
                            </Tag>
                        ))}
                    </Flex>
                )}

                {project.tags?.length > 0 && (
                    <Flex gap="small" wrap>
                        {project.tags.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                    </Flex>
                )}

                {project.links?.length > 0 && (
                    <Flex gap="small" wrap>
                        {project.links.map((link) => (
                            <LinkButton key={link} link={link} />
                        ))}
                    </Flex>
                )}

                {project.created_at && (
                    <Flex align="center" justify="space-between">
                        <Flex gap="small">
                            <CalendarOutlined />
                            <Text type="secondary">
                                {new Date(
                                    project.created_at
                                ).toLocaleDateString()}
                            </Text>
                        </Flex>
                        {project.is_starred && (
                            <Tooltip title="Starred Project">
                                <StarFilled style={{ color: "#fadb14" }} />
                            </Tooltip>
                        )}
                    </Flex>
                )}
            </Flex>
        </Card>
    );
}

ProjectCard.propTypes = {
    project: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        technologies: PropTypes.arrayOf(PropTypes.string),
        tags: PropTypes.arrayOf(PropTypes.string),
        links: PropTypes.arrayOf(PropTypes.string),
        created_at: PropTypes.string,
        is_starred: PropTypes.bool, // Add is_starred field
    }).isRequired,
};

// Add this CSS to your stylesheet
// .project-title:hover {
//     color: #1890ff;
// }
