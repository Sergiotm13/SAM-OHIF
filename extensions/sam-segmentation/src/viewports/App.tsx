import { useState, useEffect, CSSProperties } from 'react';
import '../styles/App.css';
import UserOptions from './UserOptions';
import React from 'react';
import { imageDataUrlToBlob } from '../resources/ImageCharging';
import { DrawingCanvas } from './DrawingCanvas';
import Portal from './Portal';
import DropDownSvg from '../assets/drop-down-icon.svg';
import DropLeftSvg from '../assets/drop-left-icon.svg';

import {
  POSITIVE_POINT_COLOR,
  NEGATIVE_POINT_COLOR,
  BOX_COLOR,
  BOX_WIDTH,
  BORDER_POINT_COLOR,
  BORDER_POINT_WIDTH,
} from '../resources/const';

import BeatLoader from 'react-spinners/ClipLoader';
import { set } from '@kitware/vtk.js/macros';

const override_spinner_css: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  position: 'fixed',
  top: '50%',
  left: '50%',
};

function App({ servicesManager }) {
  const [selectedOption, setSelectedOption] = useState(-2);

  const [rectangles, setRectangles] = useState([]);
  const [positivePoints, setPositivePoints] = useState([]);
  const [negativePoints, setNegativePoints] = useState([]);
  const [model, setModel] = useState(null);
  const [boxColor, setBoxColor] = useState(BOX_COLOR);
  const [pointsRadius, setPointsRadius] = useState(8);

  const [activeViewport, setActiveViewport] = useState(null);
  const [segmenting, setSegmenting] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);
  const [maskImageSrc, setMaskImageSrc] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [activeCanvasWidth, setActiveCanvasWidth] = useState(null);
  const [activeCanvasHeight, setActiveCanvasHeight] = useState(null);
  const [activeCanvasTop, setActiveCanvasTop] = useState(null);
  const [activeCanvasLeft, setActiveCanvasLeft] = useState(null);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const [loading, setLoading] = useState(false);

  const { viewportGridService } = servicesManager.services;
  const { uiNotificationService } = servicesManager.services;

  useEffect(() => {
    if (segmenting === false) {
      if (selectedOption !== -2)
        uiNotificationService.show({
          title: 'Exiting SAM Segmentation..',
          message: 'You have exited SAM Segmentation.',
          type: 'info',
          duration: 3000,
        });
      setMaskImageSrc(null);
      setSelectedImage(null);
      setImageSrc(null);
    }
  }, [segmenting]);

  useEffect(() => {
    viewportGridService.subscribe(
      viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
      handleActiveViewPortChange
    );

    viewportGridService.subscribe(viewportGridService.EVENTS.LAYOUT_CHANGED, handleLayoutChange);
  }, []);

  const handleActiveViewPortChange = () => {
    console.log('El viewport activo ha cambiado');
    setSegmenting(false);
  };

  const handleLayoutChange = () => {
    console.log('El layout ha cambiado');
    setSegmenting(false);
  };

  const handleToggleMask = () => {
    if (selectedImage === imageSrc) {
      setSelectedImage(maskImageSrc);
    } else {
      setSelectedImage(imageSrc);
    }
  };

  const handleCanvasClean = () => {
    uiNotificationService.show({
      title: 'Screen cleaned successfully.',
      type: 'success',
      duration: 3000,
    });
    setSelectedOption(-1);
    setMaskImageSrc(null);
    setSelectedImage(null);
  };

  const handleScaleChange = (scaleX, scaleY) => {
    setScaleX(scaleX);
    setScaleY(scaleY);
  };

  const handleChangeOption = (buttonNumber: number) => {
    if (selectedOption === buttonNumber) {
      setSelectedOption(-1);
    } else {
      setSelectedOption(buttonNumber);
    }
  };

  const getImageUsed = () => {
    console.log('El viewport activo es: ', activeViewport);
    const canvas = document.getElementsByClassName('cornerstone-canvas')[
      activeViewport
    ] as HTMLCanvasElement;
    console.log('El canvas es: ', canvas);

    if (!canvas) {
      return;
    }
    return canvas.toDataURL('image/png');
  };

  const toggle_sam_segmentation = () => {
    // Elimino los puntos y box que hubiera antes
    setRectangles([]);
    setPositivePoints([]);
    setNegativePoints([]);
    console.log('Preparando la segmentación con segmenting: ', segmenting);

    if (segmenting === true) {
      setSegmenting(false);
      return;
    } else setSegmenting(true);

    // Veo cual es el viewport activo ahora

    // Obtener el id del viewport activo
    const active_viewport_id = viewportGridService.getActiveViewportId();

    // Obtengo el estado general de los viewports, para sacarlos todos
    const viewport_state = viewportGridService.getState();
    const viewports = viewport_state.viewports;

    // Sabiendolos todos, saco el índice del viewport activo
    let active_viewport_index = 0;
    const viewportsArray = Array.from(viewports);
    for (let i = 0; i < viewportsArray.length; i++) {
      if (viewportsArray[i][0] === active_viewport_id) {
        active_viewport_index = i;
        break;
      }
    }

    const active_canvas = document.getElementsByClassName('cornerstone-canvas')[
      active_viewport_index
    ] as HTMLCanvasElement;

    if (!active_canvas) {
      return;
    }

    // Me guardo el viewport activo y la imagen
    setImageSrc(active_canvas.toDataURL('image/png'));
    setActiveViewport(active_viewport_index);

    const rect = active_canvas.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    // Guardo las variables de configuración del canvas
    setActiveCanvasWidth(active_canvas.width);
    setActiveCanvasHeight(active_canvas.height);
    setActiveCanvasTop(top);
    setActiveCanvasLeft(left);
  };

  async function fetchDicomFile(timestamp: number) {
    const response = await fetch(`http://localhost:8000/get_dicom_image/${timestamp}`);

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `output_${timestamp}.dcm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      console.error('Failed to fetch DICOM file', response.statusText);
    }
  }

  const sendImageAndInputsToServer = async () => {
    if (positivePoints.length === 0 || negativePoints.length === 0) {
      setLoading(false);
      uiNotificationService.show({
        title: 'Error segmenting the image',
        message: 'You need to select at least one positive and one negative point.',
        type: 'error',
        duration: 3000,
      });

      return;
    }

    const sam_input = {
      model: model ? model.label : undefined,
      rectangles: rectangles.map(single_rectangle => ({
        startX: single_rectangle.rect[0].startX,
        startY: single_rectangle.rect[0].startY,
        width: single_rectangle.rect[0].width,
        height: single_rectangle.rect[0].height,
      })),
      positive_points: positivePoints.map(single_point => ({
        x: single_point.point.x / scaleX,
        y: single_point.point.y / scaleY,
      })),
      negative_points: negativePoints.map(single_point => ({
        x: single_point.point.x / scaleX,
        y: single_point.point.y / scaleY,
      })),
    };

    const imageUsed = getImageUsed();

    const formData = new FormData();
    formData.append('file', imageDataUrlToBlob(imageUsed), 'image.png');
    formData.append('sam_input', JSON.stringify(sam_input));

    show_segmenting_in_progress();

    try {
      const response = await fetch(`http://localhost:8000/segment_input_image/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const timestamp = data.timestamp;

      // Fetch the segmented image
      const imageResponse = await fetch(`http://localhost:8000/get_segmented_image/${timestamp}`);
      const mask = await imageResponse.blob();

      // Use the timestamp to fetch the DICOM file
      console.log('Timestamp:', timestamp);
      // Fetch the DICOM file
      const dicomResponse = await fetch(`http://localhost:8000/get_dicom_image/${timestamp}`);
      if (dicomResponse.ok) {
        const dicomBlob = await dicomResponse.blob();
        const dicomUrl = window.URL.createObjectURL(dicomBlob);
        const a = document.createElement('a');
        // Set a classname
        a.className = 'download-dicom-sam';
        a.href = dicomUrl;
        a.download = `output_${timestamp}.dcm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Failed to fetch DICOM file', dicomResponse.statusText);
      }
      show_succeeded_segmentation();

      return mask;
    } catch (error) {
      setLoading(false);
      show_segmenting_error();
      console.error('Error on dcm:', error);
    }
  };

  const show_segmenting_error = () => {
    uiNotificationService.show({
      title: 'Error segmenting the image',
      message: 'There was an error segmenting the image.',
      type: 'error',
      duration: 3000,
    });
  };

  const show_segmenting_in_progress = () => {
    uiNotificationService.show({
      title: 'Segmenting the image...',
      message: 'It can take several seconds or minutes, wait for it to end.',
      type: 'info',
      duration: 20000,
    });
  };

  const show_succeeded_segmentation = () => {
    uiNotificationService.show({
      title: 'Image segmentation completed',
      type: 'success',
      duration: 3000,
    });
  };

  const segment = async () => {
    setLoading(true);

    const mask = await sendImageAndInputsToServer();

    const maskImg = URL.createObjectURL(mask);

    setLoading(false);

    setMaskImageSrc(maskImg);

    setSelectedImage(maskImg);
  };

  const handleChangeBoxColor = (newColor: string) => {
    console.log('Cambiando el color de los cuadros');
    setBoxColor(newColor);
  };

  const handleChangePointsRadius = (newRadius: number) => {
    console.log('Cambiando el grosor de los puntos');
    setPointsRadius(newRadius);
  };

  return (
    <div id="sam-home">
      <button
        className={`${!segmenting ? '' : 'exit-sam-btn'} toggle-sam-btn`}
        onClick={toggle_sam_segmentation}
      >
        AI Segmentation
        {(segmenting && <DropDownSvg className="drop-down-icon" />) || (
          <DropLeftSvg className="drop-left-icon" />
        )}
      </button>

      {segmenting && (
        <UserOptions
          handleChangeOption={handleChangeOption}
          selectedOption={selectedOption}
          handleChangeModel={setModel}
          segment={segment}
          toggleMask={maskImageSrc ? true : false}
          handleToggleMask={handleToggleMask}
          handleChangeBoxColor={handleChangeBoxColor}
          handleChangePointsRadius={handleChangePointsRadius}
          pointsRadius={pointsRadius}
        />
      )}

      <Portal>
        {loading && (
          <div className="loader-container">
            <BeatLoader
              color={'#ffffff'}
              loading={loading}
              cssOverride={override_spinner_css}
              size={150}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}

        <DrawingCanvas
          segmenting={segmenting}
          selectedOption={selectedOption}
          servicesManager={servicesManager}
          rectangles={rectangles}
          setRectangles={setRectangles}
          positivePoints={positivePoints}
          setPositivePoints={setPositivePoints}
          negativePoints={negativePoints}
          setNegativePoints={setNegativePoints}
          activeCanvasWidth={activeCanvasWidth}
          activeCanvasHeight={activeCanvasHeight}
          activeCanvasTop={activeCanvasTop}
          activeCanvasLeft={activeCanvasLeft}
          handleScaleChange={handleScaleChange}
          onCanvasClean={handleCanvasClean}
          imgSrc={selectedImage}
          boxColor={boxColor}
          pointsRadius={pointsRadius}
        />
      </Portal>
    </div>
  );
}

export default App;
