import { useState } from "react";
import { Modal, Button, Input, Form, Alert } from "antd";
import axios from "axios";
import PropTypes from "prop-types";

export function LoginDialog({ isOpen, setIsOpen }) {
    const [form] = Form.useForm();
    const [error, setError] = useState("");

    const handleLogin = async (values) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/token/",
                values
            );
            localStorage.setItem("token", response.data.access);
            setError(""); // Clear any previous errors
            setIsOpen(false);
        } catch (err) {
            setError("Invalid credentials, please try again.");
            console.error("Error logging in", err);
        }
    };

    return (
        <Modal
            title="Login"
            open={isOpen}
            onCancel={() => setIsOpen(false)}
            footer={[
                <Button key="cancel" onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                >
                    Login
                </Button>,
            ]}
            getContainer={false}
            style={{ zIndex: 1050 }}
        >
            <Form form={form} onFinish={handleLogin}>
                <Form.Item
                    name="username"
                    rules={[
                        { required: true, message: "Please enter username" },
                    ]}
                >
                    <Input placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: "Please enter password" },
                    ]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>
            </Form>
            {error && <Alert message={error} type="error" showIcon />}
        </Modal>
    );
}

LoginDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};
