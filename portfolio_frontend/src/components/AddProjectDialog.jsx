import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { getToken } from "../services/auth";
import { useDispatch } from "react-redux";
import { addProject } from "../store/projectsSlice";
import ProjectDialog from "./ProjectDialog";
import PropTypes from "prop-types";

export function AddProjectDialog({ isOpen, setIsOpen, onUnauthorized }) {
    const dispatch = useDispatch();

    const handleAddProject = async (projectData) => {
        const formData = new FormData();
        const { attached_files, ...rest } = projectData;

        formData.append("projectData", JSON.stringify(rest));

        if (attached_files) {
            for (let i = 0; i < attached_files.length; i++) {
                formData.append("attached_files", attached_files[i]);
            }
        }

        const response = await axios.post(
            "/api/projects/",
            formData,
            {
                headers: { Authorization: `Bearer ${getToken()}` },
            }
        );
        dispatch(addProject(response.data));
    };

    return (
        <ProjectDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onSubmit={handleAddProject}
            onUnauthorized={onUnauthorized}
            title="Add New Project"
            triggerButton={
                <Button type="primary" icon={<PlusOutlined />}>
                    Add Project
                </Button>
            }
        />
    );
}

AddProjectDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    onUnauthorized: PropTypes.func.isRequired,
};
