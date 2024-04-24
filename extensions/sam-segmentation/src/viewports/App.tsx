import { useState, useEffect } from 'react';
import '../styles/App.css';
import ImageContainer from './ImageContainer';
import UserOptions from './UserOptions';
import React from 'react';
import { imageDataUrlToBlob } from '../resources/ImageCharging';

function App({ servicesManager }) {
  const [sessionID, setSessionID] = useState('');
  const [selectedOption, setSelectedOption] = useState(-1);

  const [rectangles, setRectangles] = useState([]);
  const [positivePoints, setPositivePoints] = useState([]);
  const [negativePoints, setNegativePoints] = useState([]);
  const [model, setModel] = React.useState(null);
  const [modalDisplay, setModalDisplay] = useState('block');
  const [imageSrc, setImageSrc] = useState('');

  // Iniciar sesión al cargar la página
  useEffect(() => {
    if (sessionID === '') setSessionID(Math.random().toString(36).substring(7));
  }, []);

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
      model: model.label,
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

    console.log(model);

    const formData = new FormData();
    formData.append('file', imageDataUrlToBlob(imageSrc), 'image.png');
    formData.append('sam_input', JSON.stringify(sam_input));

    try {
      const response = await fetch(`http://localhost:8000/get_image_and_parameters/${sessionID}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const segment = () => {
    sendImageAndInputsToServer();
  };

  return (
    <>
      <div id="customModal" className={`custom-modal custom-modal-previewing ${modalDisplay}`}>
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
      </div>
      <button onClick={showModal}>SAM Segmentation</button>
    </>
  );
}

export default App;
