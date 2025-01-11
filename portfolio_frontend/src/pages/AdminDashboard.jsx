import { useState, useEffect } from "react";
import {
    Tag,
    Table,
    Typography,
    Button,
    Input,
    Space,
    Popconfirm,
    Statistic,
    Flex,
    Tooltip,
} from "antd";
import {
    DeleteOutlined,
    SearchOutlined,
    EditOutlined,
    PlusOutlined,
    ProjectOutlined,
    ClockCircleOutlined,
    StarFilled,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { AddProjectDialog } from "../components/AddProjectDialog";
import { EditProjectDialog } from "../components/EditProjectDialog";
import { LoginDialog } from "../components/LoginDialog";
import axios from "axios";
import { getToken } from "../services/auth";
import { fetchProjectsAsync, deleteProject } from "../store/projectsSlice";

const { Title } = Typography;

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const projects = useSelector((state) => state.projects.projects);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchProjectsAsync());
    }, [dispatch]);

    const handleProjectDelete = (projectId) => {
        axios
            .delete(`/api/projects/${projectId}/`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            .then(() => {
                dispatch(deleteProject(projectId));
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    setIsLoginDialogOpen(true);
                } else {
                    console.error("Ошибка при удалении проекта:", error);
                }
            });
    };

    const handleEditClick = (project) => {
        setSelectedProject({
            ...project,
            attached_files: project.attached_files.map(
                ({file: fileUrl}, index) => ({
                    uid: index,
                    name: decodeURIComponent(fileUrl.split("/").pop()),
                    status: "done",
                    url: fileUrl,
                })
            ),
        });
        setIsEditDialogOpen(true);
    };

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lastProject = projects[projects.length - 1];

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Flex justify="space-between" align="center" gap="middle" wrap>
                <Statistic
                    title="Всего проектов"
                    value={projects.length}
                    prefix={<ProjectOutlined />}
                />
                <Statistic
                    title="Последний проект"
                    value={lastProject?.name || "Нет проектов"}
                    prefix={<ClockCircleOutlined />}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddDialogOpen(true)}
                    size="large"
                >
                    Добавить проект
                </Button>
            </Flex>

            <Flex justify="space-between" align="center" gap="middle">
                <Title level={4}>Проекты</Title>
                <Input
                    placeholder="Поиск проектов"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    allowClear
                />
            </Flex>

            <Table
                dataSource={filteredProjects}
                rowKey="id"
                style={{ marginTop: 16 }}
            >
                <Table.Column
                    title="Название"
                    dataIndex="name"
                    key="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                    render={(text, record) => (
                        <Space>
                            {record.is_starred && (
                                <Tooltip title="Starred Project">
                                    <StarFilled style={{ color: "#fadb14" }} />
                                </Tooltip>
                            )}
                            {text}
                        </Space>
                    )}
                />
                <Table.Column
                    title="Дата создания"
                    dataIndex="created_at"
                    key="created_at"
                    sorter={(a, b) =>
                        new Date(a.created_at) - new Date(b.created_at)
                    }
                    render={(text) => (
                        <>
                            {new Date(text).toLocaleDateString()}{" "}
                            {new Date(text).toLocaleTimeString()}
                        </>
                    )}
                />
                <Table.Column
                    title="Технологии"
                    dataIndex="technologies"
                    key="technologies"
                    render={(technologies) => (
                        <Space wrap>
                            {technologies.map((tech) => (
                                <Tag key={tech} color="blue">
                                    {tech}
                                </Tag>
                            ))}
                        </Space>
                    )}
                />
                <Table.Column
                    title="Теги"
                    dataIndex="tags"
                    key="tags"
                    render={(tags) => (
                        <Space wrap>
                            {tags.map((tag) => (
                                <Tag key={tag} color="green">
                                    {tag}
                                </Tag>
                            ))}
                        </Space>
                    )}
                />
                <Table.Column
                    title="Действия"
                    key="actions"
                    render={(_, project) => (
                        <Space>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEditClick(project)}
                            />
                            <Popconfirm
                                title="Удалить проект?"
                                description="Вы уверены, что хотите удалить этот проект?"
                                onConfirm={() =>
                                    handleProjectDelete(project.id)
                                }
                                okText="Да"
                                cancelText="Нет"
                            >
                                <Button
                                    type="primary"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </Space>
                    )}
                />
            </Table>

            <AddProjectDialog
                isOpen={isAddDialogOpen}
                setIsOpen={setIsAddDialogOpen}
                onUnauthorized={() => setIsLoginDialogOpen(true)}
            />

            <EditProjectDialog
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                project={selectedProject}
                onUnauthorized={() => setIsLoginDialogOpen(true)}
            />

            <LoginDialog
                isOpen={isLoginDialogOpen}
                setIsOpen={setIsLoginDialogOpen}
            />
        </Space>
    );
};

export default AdminDashboard;
