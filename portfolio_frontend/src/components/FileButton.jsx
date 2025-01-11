import { Button } from "antd";
import { FileOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

function FileButton({ fileUrl, fileName }) {
    return (
        <Button
            type="default"
            icon={<FileOutlined />}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="large"
        >
            {fileName.length > 16
                ? `${fileName.substring(0, 16)}...`
                : fileName}
        </Button>
    );
}

FileButton.propTypes = {
    fileUrl: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired,
};

export default FileButton;
