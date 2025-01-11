import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import axios from "axios";
import { getToken } from "../services/auth";
import { useDispatch } from "react-redux";
import { editProject } from "../store/projectsSlice";
import PropTypes from "prop-types";
import ProjectDialog from "./ProjectDialog";

export function EditProjectDialog({
    isOpen,
    setIsOpen,
    project,
    onUnauthorized,
}) {
    const dispatch = useDispatch();

    const handleEditProject = async (projectData) => {
        const formData = new FormData();
        const { attached_files, ...rest } = projectData;

        formData.append("projectData", JSON.stringify(rest));

        if (attached_files) {
            for (let i = 0; i < attached_files.length; i++) {
                if (!attached_files[i].url) {
                    formData.append("attached_files", attached_files[i]);
                }
            }

            const retainedFiles = attached_files.filter((file) => file.url);
            formData.append(
                "retained_files",
                JSON.stringify(retainedFiles.map((file) => file.url))
            );
        }

        const response = await axios.put(
            `/api/projects/${project.id}/`,
            formData,
            {
                headers: { Authorization: `Bearer ${getToken()}` },
            }
        );
        dispatch(editProject(response.data));
    };

    return (
        <ProjectDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onSubmit={handleEditProject}
            onUnauthorized={onUnauthorized}
            initialData={project}
            title="Edit Project"
            triggerButton={
                <Button variant="soft" color="blue">
                    <EditOutlined />
                </Button>
            }
        />
    );
}

EditProjectDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    project: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        technologies: PropTypes.arrayOf(PropTypes.string),
        tags: PropTypes.arrayOf(PropTypes.string),
        links: PropTypes.arrayOf(PropTypes.string),
        created_at: PropTypes.string,
        attached_files: PropTypes.arrayOf(PropTypes.object),
        is_starred: PropTypes.bool, // Add is_starred field
    }).isRequired,
    onUnauthorized: PropTypes.func.isRequired,
};
