import { useNavigate } from "react-router-dom";
import { Flex, Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

export default function HeaderWithBackButton({ title }) {
    const navigate = useNavigate();

    return (
        <Flex align="center">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                type="link"
            >
                Назад
            </Button>
            <Typography.Title level={2} style={{ marginTop: "0.5em" }}>
                {title}
            </Typography.Title>
        </Flex>
    );
}

HeaderWithBackButton.propTypes = {
    title: PropTypes.string.isRequired,
};
