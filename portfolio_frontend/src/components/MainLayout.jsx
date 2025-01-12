import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Typography,
    Flex,
    Button,
    ConfigProvider,
    Layout,
    theme as antdTheme,
    Space,
} from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { RiTelegram2Fill, RiGithubFill } from "react-icons/ri";
import PropTypes from "prop-types";

import logoDark from "../assets/site_logo_dark.svg";
import logoLight from "../assets/site_logo_light.svg";


const { Header, Content, Footer } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antdTheme;

export default function MainLayout({ children }) {
    const [darkMode, setDarkMode] = useState(false);
    const windowQuery = window.matchMedia("(prefers-color-scheme:dark)");

    const darkModeChange = useCallback((event) => {
        setDarkMode(event.matches);
    }, []);

    useEffect(() => {
        windowQuery.addEventListener("change", darkModeChange);
        return () => {
            windowQuery.removeEventListener("change", darkModeChange);
        };
    }, [windowQuery, darkModeChange]);

    useEffect(() => {
        setDarkMode(windowQuery.matches);
    }, [windowQuery.matches]);

    useEffect(() => {
        document.body.style.backgroundColor = darkMode ? "#141414" : "#f5f5f5";
        document.body.style.color = darkMode ? "#ffffff" : "#000000";

        const updateFavicon = () => {
            const favicon = document.getElementById("favicon");
            if (favicon) {
                favicon.href = darkMode ? logoDark : logoLight;
            }
        };

        updateFavicon();
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((prev) => !prev);
    };

    const layoutStyle = {
        minHeight: "100vh",
    };

    const headerStyle = {
        padding: 0,
        background: "transparent",
    };

    const headerContentStyle = {
        height: 64,
        padding: "0 24px",
        maxWidth: 1200,
        margin: "0 auto",
    };

    const contentStyle = {
        padding: "24px",
        maxWidth: 1200,
        margin: "0 auto",
    };

    const iconStyle = {
        width: 20,
        height: 20,
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
                token: {
                    colorBgContainer: darkMode ? "#141414" : "#ffffff",
                    colorBgLayout: darkMode ? "#141414" : "#f5f5f5",
                },
            }}
        >
            <Layout style={layoutStyle}>
                <Header style={headerStyle}>
                    <Flex
                        justify="space-between"
                        align="center"
                        style={headerContentStyle}
                    >
                        <Link to="/">
                            <Flex align="center">
                                <img
                                    src={
                                        darkMode
                                            ? logoDark
                                            : logoLight
                                    }
                                    alt="Logo"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        marginRight: 8,
                                    }}
                                />
                                <Typography.Title
                                    level={3}
                                    style={{ margin: 0 }}
                                >
                                    крутфолио
                                </Typography.Title>
                            </Flex>
                        </Link>
                        <Button
                            type="default"
                            onClick={toggleTheme}
                            icon={
                                darkMode ? (
                                    <SunOutlined style={iconStyle} />
                                ) : (
                                    <MoonOutlined style={iconStyle} />
                                )
                            }
                        />
                    </Flex>
                </Header>

                <Content>
                    <div style={contentStyle}>{children}</div>
                </Content>

                <Footer style={{ background: "transparent" }}>
                    <Flex vertical align="center" gap="small">
                        <Space size="large">
                            <Button
                                type="link"
                                href="https://github.com/dant4ick"
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<RiGithubFill style={iconStyle} />}
                            />
                            <Button
                                type="link"
                                href="https://t.me/poperdel"
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<RiTelegram2Fill style={iconStyle} />} // Use Telegram icon from react-icons
                            />
                        </Space>
                        <Typography.Text style={{ fontSize: 14 }}>
                            © {new Date().getFullYear()} крутфолио
                        </Typography.Text>
                    </Flex>
                </Footer>
            </Layout>
        </ConfigProvider>
    );
}

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
