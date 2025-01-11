import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import MainLayout from "./components/MainLayout";
import HomePage from "./pages/HomePage";
import ProjectsList from "./pages/ProjectsList";
import ProjectPage from "./pages/ProjectPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<ProjectsList />} />
                    <Route
                        path="/projects/:projectId"
                        element={<ProjectPage />}
                    />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </MainLayout>
        </Router>
    );
}

export default App;
