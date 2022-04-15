import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import canvasToBlob from 'async-canvas-to-blob';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import ReactCrop from 'react-image-crop';
import loggerFactory from '~/utils/logger';
import 'react-image-crop/dist/ReactCrop.css';
import { toastError } from '~/client/util/apiNotification';

const logger = loggerFactory('growi:ImageCropModal');

interface ICropOptions {
  aspect: number
  unit: string,
  x: number
  y: number
  width: number,
  height: number,
}

type CropOptions = ICropOptions | null

type Props = {
  show: boolean,
  src: string | ArrayBuffer | null,
  onModalClose: () => void,
  onCropCompleted: (res: any) => void
}
const CropLogoModal: FC<Props> = (props: Props) => {

  const {
    show, src, onModalClose, onCropCompleted,
  } = props;

  const [imageRef, setImageRef] = useState<HTMLImageElement>();
  const [cropOptions, setCropOtions] = useState<CropOptions>(null);

  const reset = useCallback(() => {
    if (imageRef) {
      const size = Math.min(imageRef.width, imageRef.height);
      setCropOtions({
        aspect: 1,
        unit: 'px',
        x: imageRef.width / 2 - size / 2,
        y: imageRef.height / 2 - size / 2,
        width: size,
        height: size,
      });
    }
  }, [imageRef]);

  useEffect(() => {
    document.body.style.position = 'static';
    reset();
  }, [reset]);

  const onImageLoaded = (image) => {
    setImageRef(image);
    reset();
    return false;
  };


  const onCropChange = (crop) => {
    setCropOtions(crop);
  };

  const getCroppedImg = async(image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    try {
      const blob = await canvasToBlob(canvas);
      return blob;
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to draw image'));
    }
  };

  const crop = async() => {
    // crop immages
    if (imageRef && cropOptions?.width && cropOptions.height) {
      const result = await getCroppedImg(imageRef, cropOptions);
      onCropCompleted(result);
    }
  };

  return (
    <Modal isOpen={show} toggle={onModalClose}>
      <ModalHeader tag="h4" toggle={onModalClose} className="bg-info text-light">
        Image Crop
      </ModalHeader>
      <ModalBody className="my-4">
        <ReactCrop src={src} crop={cropOptions} onImageLoaded={onImageLoaded} onChange={onCropChange} />
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-outline-danger rounded-pill mr-auto" onClick={reset}>
          Reset
        </button>
        <button type="button" className="btn btn-outline-secondary rounded-pill mr-2" onClick={onModalClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-outline-primary rounded-pill" onClick={crop}>
          Crop
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default CropLogoModal;
