import { useState } from 'react';
import '../styles/App.css';
import ImageContainer from './ImageContainer';
import UserOptions from './UserOptions';
import React from 'react';
import { imageDataUrlToBlob } from '../resources/ImageCharging';

function App({ servicesManager }) {
  const [selectedOption, setSelectedOption] = useState(-1);

  const [rectangles, setRectangles] = useState([]);
  const [positivePoints, setPositivePoints] = useState([]);
  const [negativePoints, setNegativePoints] = useState([]);
  const [model, setModel] = React.useState(null);
  const [modalDisplay, setModalDisplay] = useState('block');
  const [imageSrc, setImageSrc] = useState('');

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

  const sendParametersToServer = async () => {
    const sam_input = {
      model: model,
      rectangles: rectangles.map(
        single_rectangle => (
          console.log('rect'),
          console.log(single_rectangle),
          {
            startX: single_rectangle.rect[0].startX,
            startY: single_rectangle.rect[0].startY,
            width: single_rectangle.rect[0].width,
            height: single_rectangle.rect[0].height,
          }
        )
      ),
      positive_points: positivePoints.map(single_point => ({
        x: single_point.point.x,
        y: single_point.point.y,
      })),
      negative_points: negativePoints.map(single_point => ({
        x: single_point.point.x,
        y: single_point.point.y,
      })),
    };
    try {
      const response = await fetch('http://localhost:8000/get_parameters/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sam_input),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendImageToServer = async () => {
    const formData = new FormData();
    formData.append('file', imageDataUrlToBlob(imageSrc), 'image.png');

    try {
      const response = await fetch('http://localhost:8000/get_image/', {
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
    console.log('Segmenting');
    sendParametersToServer();
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
