import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const projectsSlice = createSlice({
    name: "projects",
    initialState: {
        projects: [],
    },
    reducers: {
        addProject: (state, action) => {
            if (Array.isArray(action.payload)) {
                state.projects.push(...action.payload);
            } else {
                state.projects.push(action.payload);
            }
        },
        deleteProject: (state, action) => {
            state.projects = state.projects.filter(
                (project) => project.id !== action.payload
            );
        },
        editProject: (state, action) => {
            const { id, ...changes } = action.payload;
            const project = state.projects.find((project) => project.id === id);
            if (project) {
                Object.keys(changes).forEach((key) => {
                    project[key] = changes[key];
                });
            }
        },
        fetchProjects: (state, action) => {
            state.projects = action.payload;
        },
    },
});

export const { addProject, deleteProject, editProject, fetchProjects } = projectsSlice.actions;

export const fetchProjectsAsync = () => async (dispatch) => {
    try {
        const response = await axios.get("/api/projects/");
        dispatch(fetchProjects(response.data));
    } catch (error) {
        console.error("Ошибка при загрузке проектов:", error);
    }
};

export default projectsSlice;