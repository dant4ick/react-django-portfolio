import PropTypes from "prop-types";
import { GithubOutlined, LinkOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

export default function LinkButton({ link }) {
    const isGithub = link.includes("github.com");
    const url = new URL(link);

    const buttonProps = {
        type: isGithub ? "primary" : "default",
        icon: isGithub ? <GithubOutlined /> : <LinkOutlined />,
        href: link,
        target: "_blank",
        rel: "noopener noreferrer",
        size: "middle",
        ghost: isGithub,
    };

    const label = isGithub
        ? "GitHub"
        : url.hostname.length > 16
        ? `${url.hostname.substring(0, 16)}...`
        : url.hostname;

    return (
        <Tooltip title={link}>
            <Button {...buttonProps}>{label}</Button>
        </Tooltip>
    );
}

LinkButton.propTypes = {
    link: PropTypes.string.isRequired,
};
