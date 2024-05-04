import { useState, useEffect, useRef } from 'react';
import '../styles/App.css';
import UserOptions from './UserOptions';
import React from 'react';
import { imageDataUrlToBlob } from '../resources/ImageCharging';
import { DrawingCanvas } from './DrawingCanvas';
import Portal from './Portal';
import DropDownSvg from '../assets/drop-down-icon.svg';
import DropLeftSvg from '../assets/drop-left-icon.svg';

function App({ servicesManager }) {
  const [selectedOption, setSelectedOption] = useState(-2);

  const [rectangles, setRectangles] = useState([]);
  const [positivePoints, setPositivePoints] = useState([]);
  const [negativePoints, setNegativePoints] = useState([]);
  const [model, setModel] = React.useState(null);

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

  const sendImageAndInputsToServer = async () => {
    positivePoints.forEach(single_point => {
      console.log('Tengo un punto positivo para mandar a la api');
      console.log('Con las siguientes coordenadas:');
      console.log('El x: ', single_point.point.x);
      console.log('El y: ', single_point.point.y);
      console.log('El scaleX: ', scaleX);
      console.log('El scaleY: ', scaleY);
    });

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

    console.log(sam_input);

    const imageUsed = getImageUsed();

    const formData = new FormData();
    formData.append('file', imageDataUrlToBlob(imageUsed), 'image.png');
    formData.append('sam_input', JSON.stringify(sam_input));
    uiNotificationService.show({
      title: 'Segmenting the image...',
      message: 'It can take several seconds or minutes, we will notify you when it ends.',
      type: 'info',
      duration: 3000,
    });
    try {
      const response = await fetch(`http://localhost:8000/get_image_and_parameters/`, {
        method: 'POST',
        body: formData,
      });

      const mask = await response.blob();
      console.log(mask);
      console.log(typeof mask);

      uiNotificationService.show({
        title: 'Image segmentation completed',
        type: 'success',
        duration: 3000,
      });

      return mask;
    } catch (error) {
      uiNotificationService.show({
        title: 'Error segmenting the image',
        message: 'There was an error segmenting the image.',
        type: 'error',
        duration: 3000,
      });
      console.error('Error:', error);
    }
  };

  const segment = async () => {
    const mask = await sendImageAndInputsToServer();

    const maskImg = URL.createObjectURL(mask);

    setMaskImageSrc(maskImg);

    setSelectedImage(maskImg);
  };

  return (
    <div id="sam-home">
      <button
        className={`${!segmenting ? '' : 'exit-sam-btn'} toggle-sam-btn`}
        onClick={toggle_sam_segmentation}
      >
        SAM Segmentation
        {(segmenting && <DropDownSvg className="drop-down-icon" />) || (
          <DropLeftSvg className="drop-left-icon" />
        )}
      </button>

      {segmenting && (
        <UserOptions
          handleChangeOption={handleChangeOption}
          selectedOption={selectedOption}
          setModel={setModel}
          segment={segment}
          toggleMask={maskImageSrc ? true : false}
          handleToggleMask={handleToggleMask}
        />
      )}

      <Portal>
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
        />
      </Portal>
    </div>
  );
}

export default App;
