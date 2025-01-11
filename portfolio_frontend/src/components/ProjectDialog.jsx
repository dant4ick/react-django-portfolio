import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
    Modal,
    Button,
    Form,
    Input,
    Select,
    DatePicker,
    Alert,
    Upload,
    Switch,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

function ProjectDialog({
    isOpen,
    setIsOpen,
    onSubmit,
    onUnauthorized,
    initialData,
    title,
}) {
    const [form] = Form.useForm();
    const projects = useSelector((state) => state.projects.projects);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [fileList, setFileList] = useState([]);

    // Extract unique technologies and tags from all projects
    const allTechnologies = [
        ...new Set(projects.flatMap((project) => project.technologies)),
    ];
    const allTags = [...new Set(projects.flatMap((project) => project.tags))];

    useEffect(() => {
        if (initialData && isOpen) {
            form.setFieldsValue({
                ...initialData,
                links: initialData.links || [],
                created_at: dayjs(initialData.created_at),
                is_starred: initialData.is_starred, // Set initial value for is_starred
            });
            setFileList(
                (initialData.attached_files || []).map((file, index) => ({
                    uid: `${file.name}-${index}`,
                    name: file.name,
                    status: "done",
                    url: file.url, // Ensure file object has URL property
                }))
            );
        } else if (!isOpen) {
            form.resetFields();
            setFileList([]);
        }
    }, [initialData, isOpen, form]);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const values = await form.validateFields();
            setAlertMessage("");

            const projectData = {
                ...values,
                created_at: values.created_at.format("YYYY-MM-DD"),
                attached_files: fileList,
            };

            console.log(projectData);

            await onSubmit(projectData);

            setIsLoading(false);
            setIsOpen(false);
        } catch (error) {
            setIsLoading(false);
            if (error.errorFields) {
                return; // Validation errors
            }
            setAlertMessage(error);

            if (error.response && error.response.status === 401) {
                onUnauthorized();
            }
        }
    };

    const handleFileUpload = (file) => {
        console.log(file);
        setFileList((prevList) => [...prevList, file]);
        return false; // Prevent automatic upload
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
            // eslint-disable-next-line no-unused-vars
        } catch (_) {
            return false;
        }
    };

    return (
        <Modal
            title={title}
            open={isOpen}
            onCancel={() => setIsOpen(false)}
            footer={[
                <Button key="cancel" onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                >
                    Save
                </Button>,
            ]}
            getContainer={false}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    technologies: [],
                    tags: [],
                    links: [],
                    created_at: dayjs(),
                    is_starred: false, // Default value for is_starred
                }}
            >
                <Form.Item
                    name="name"
                    label="Project Name"
                    rules={[
                        {
                            required: true,
                            message: "Please enter project name",
                        },
                    ]}
                >
                    <Input placeholder="Enter project name" />
                </Form.Item>

                <Form.Item
                    name="is_starred"
                    label="Starred"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Starred"
                        unCheckedChildren="Not Starred"
                    />
                </Form.Item>

                <Form.Item name="description" label="Description">
                    <TextArea
                        rows={4}
                        placeholder="Enter detailed description"
                    />
                </Form.Item>

                <Form.Item name="technologies" label="Technologies">
                    <Select
                        mode="tags"
                        placeholder="Select or enter technologies"
                        options={allTechnologies.map((tech) => ({
                            label: tech,
                            value: tech,
                        }))}
                    />
                </Form.Item>

                <Form.Item name="tags" label="Tags">
                    <Select
                        mode="tags"
                        placeholder="Select or enter tags"
                        options={allTags.map((tag) => ({
                            label: tag,
                            value: tag,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="links"
                    label="Links"
                    rules={[
                        {
                            validator: (_, value) =>
                                value && value.some((link) => !isValidUrl(link))
                                    ? Promise.reject(
                                          new Error(
                                              "Please ensure all links are valid URLs"
                                          )
                                      )
                                    : Promise.resolve(),
                        },
                    ]}
                    help="Press Enter or use a comma to add links"
                >
                    <Select
                        mode="tags"
                        placeholder="Enter links (e.g., https://example.com)"
                        open={false} // Prevent dropdown behavior since we only want input
                    />
                </Form.Item>

                <Form.Item
                    name="attached_files"
                    label="Attachments"
                    help="You can attach files to this project"
                >
                    <Upload
                        multiple
                        beforeUpload={handleFileUpload}
                        fileList={fileList}
                        onRemove={(file) => {
                            setFileList((prevList) =>
                                prevList.filter((item) => item.uid !== file.uid)
                            );
                        }}
                    >
                        <Button>Click to Upload</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="created_at"
                    label="Creation Date"
                    rules={[
                        {
                            required: true,
                            message: "Please select creation date",
                        },
                    ]}
                >
                    <DatePicker />
                </Form.Item>
            </Form>

            {alertMessage && (
                <Alert
                    message={`${alertMessage.name}: ${alertMessage.message}`}
                    description={<code>{alertMessage.code}</code>}
                    type="error"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                />
            )}
        </Modal>
    );
}

ProjectDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        description: PropTypes.string,
        technologies: PropTypes.arrayOf(PropTypes.string),
        tags: PropTypes.arrayOf(PropTypes.string),
        links: PropTypes.arrayOf(PropTypes.string),
        created_at: PropTypes.string,
        attached_files: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                url: PropTypes.string,
            })
        ),
        is_starred: PropTypes.bool, // Add is_starred field
    }),
    title: PropTypes.string.isRequired,
    onUnauthorized: PropTypes.func.isRequired,
};

export default ProjectDialog;
