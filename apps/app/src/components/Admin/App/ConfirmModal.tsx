import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

type ConfirmModalProps = {
  isModalOpen: boolean
  warningMessage: string
  supplymentaryMessage: string | null
  confirmButtonTitle: string
  onConfirm?: () => Promise<void>
  onCancel?: () => void
};

export const ConfirmModal: FC<ConfirmModalProps> = (props: ConfirmModalProps) => {
  const { t } = useTranslation();

  const onCancel = () => {
    if (props.onCancel != null) {
      props.onCancel();
    }
  };

  const onConfirm = () => {
    if (props.onConfirm != null) {
      props.onConfirm();
    }
  };

  return (
    <Modal isOpen={props.isModalOpen} toggle={onCancel}>
      <ModalHeader tag="h4" toggle={onCancel} className="bg-danger">
        <i className="icon-fw icon-question" />
        {t('Warning')}
      </ModalHeader>
      <ModalBody>
        {props.warningMessage}
        {
          props.supplymentaryMessage != null && (
            <>
              <br />
              <br />
              <span className="text-warning">
                <>
                  <i className="icon-exclamation icon-fw"></i>
                  {props.supplymentaryMessage}
                </>
              </span>
            </>
          )
        }
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary ms-3"
          onClick={onConfirm}
        >
          {props.confirmButtonTitle ?? t('Confirm')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
