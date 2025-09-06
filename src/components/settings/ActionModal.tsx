
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

export interface ModalConfig {
    title: string;
    body: React.ReactNode;
    confirmText: string;
    confirmVariant: string;
    handler: () => void;
}

interface ActionModalProps {
    show: boolean;
    onClose: () => void;
    config: ModalConfig | null;
}

export const ActionModal: React.FC<ActionModalProps> = ({ show, onClose, config }) => {
    const { t } = useLanguage();

    if (!config) {
        return null;
    }

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{config.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{config.body}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    {t("cancel")}
                </Button>
                <Button variant={config.confirmVariant} onClick={config.handler}>
                    {config.confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
