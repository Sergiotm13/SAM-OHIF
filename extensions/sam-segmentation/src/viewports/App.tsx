import { useState, useEffect, useRef } from 'react';
import '../styles/App.css';
import ImageContainer from './ImageContainer';
import UserOptions from './UserOptions';
import React from 'react';
import { imageDataUrlToBlob } from '../resources/ImageCharging';
import { DrawingCanvas } from './DrawingCanvas';
import { set } from '@kitware/vtk.js/macros';
import Portal from './Portal';

function App({ servicesManager }) {
  const [selectedOption, setSelectedOption] = useState(-1);

  const [rectangles, setRectangles] = useState([]);
  const [positivePoints, setPositivePoints] = useState([]);
  const [negativePoints, setNegativePoints] = useState([]);
  const [model, setModel] = React.useState(null);
  const [modalDisplay, setModalDisplay] = useState('block');
  const [imageSrc, setImageSrc] = useState('');

  const [activeCanvasWidth, setActiveCanvasWidth] = useState(null);
  const [activeCanvasHeight, setActiveCanvasHeight] = useState(null);
  const [activeCanvasTop, setActiveCanvasTop] = useState(null);
  const [activeCanvasLeft, setActiveCanvasLeft] = useState(null);

  const { viewportGridService } = servicesManager.services;

  const handleChangeOption = (buttonNumber: number) => {
    if (selectedOption === buttonNumber) {
      setSelectedOption(-1);
    } else {
      setSelectedOption(buttonNumber);
    }
  };

  const closeModal = () => {
    document.getElementById('customModal').style.display = 'none';
  };

  const closeModalWithFade = () => {
    setModalDisplay('fadeOut');
    setTimeout(() => {
      closeModal();
      setModalDisplay('none');
    }, 500);
  };

  const showModal = () => {
    document.getElementById('customModal').style.display = 'flex';
  };

  const sendImageAndInputsToServer = async () => {
    const sam_input = {
      model: model ? model.label : undefined,
      rectangles: rectangles.map(single_rectangle => ({
        startX: single_rectangle.rect[0].startX,
        startY: single_rectangle.rect[0].startY,
        width: single_rectangle.rect[0].width,
        height: single_rectangle.rect[0].height,
      })),
      positive_points: positivePoints.map(single_point => ({
        x: single_point.point.x,
        y: single_point.point.y,
      })),
      negative_points: negativePoints.map(single_point => ({
        x: single_point.point.x,
        y: single_point.point.y,
      })),
    };

    console.log(sam_input);

    // Obtengo la imagen que está editando el sanitario
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

    const canvas = document.getElementsByClassName('cornerstone-canvas')[
      active_viewport_index
    ] as HTMLCanvasElement;

    if (!canvas) {
      return;
    }
    // Ya tengo la imagen en canvas.toDataURL('image/png')

    const formData = new FormData();
    formData.append('file', imageDataUrlToBlob(canvas.toDataURL('image/png')), 'image.png');
    formData.append('sam_input', JSON.stringify(sam_input));

    try {
      const response = await fetch(`http://localhost:8000/get_image_and_parameters/`, {
        method: 'POST',
        body: formData,
      });

      // const mask = await response.json();
      // console.log(mask);

      const mask = await response.blob();
      console.log(mask);
      console.log(typeof mask);

      setImageSrc(URL.createObjectURL(mask));

      return mask;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const segment = () => {
    const mask = sendImageAndInputsToServer();
  };

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const prepare_sam_segmentation = () => {
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

    const rect = active_canvas.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    console.log('Estoy pintando el nuevo canvas encima de:');
    console.log(active_canvas);
    console.log('Con las siguientes dimensiones:');
    console.log('El width: ', active_canvas.width);
    console.log('El height: ', active_canvas.height);
    console.log('Con las siguientes coordenadas:');
    console.log('El top: ', top);
    console.log('El left: ', left);

    setActiveCanvasWidth(active_canvas.width);
    setActiveCanvasHeight(active_canvas.height);
    setActiveCanvasTop(top);
    setActiveCanvasLeft(left);
  };

  useEffect(() => {
    prepare_sam_segmentation();
  }, []);

  return (
    <>
      {/* <div id="customModal" className={`custom-modal custom-modal-previewing ${modalDisplay}`}>
        <div className={`modal-content modal-preview ${modalDisplay}`}>
          <span className="close-btn" onClick={closeModalWithFade}>
            &times;
          </span>

          <ImageContainer
            selectedOption={selectedOption}
            servicesManager={servicesManager}
            rectangles={rectangles}
            setRectangles={setRectangles}
            positivePoints={positivePoints}
            setPositivePoints={setPositivePoints}
            negativePoints={negativePoints}
            setNegativePoints={setNegativePoints}
            imageSrc={imageSrc}
            setImageSrc={setImageSrc}
          />

          <UserOptions
            handleChangeOption={handleChangeOption}
            selectedOption={selectedOption}
            setModel={setModel}
            segment={segment}
          />
        </div>
      </div> */}
      <button onClick={prepare_sam_segmentation}>SAM Segmentation</button>
      <UserOptions
        handleChangeOption={handleChangeOption}
        selectedOption={selectedOption}
        setModel={setModel}
        segment={segment}
      />

      <Portal>
        <DrawingCanvas
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
        />
      </Portal>
    </>
  );
}

export default App;
