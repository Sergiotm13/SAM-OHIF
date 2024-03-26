import { useState } from 'react';
import '../styles/App.css';
import ImageContainer from './ImageContainer';
import UserOptions from './UserOptions';
import React from 'react';

function App({ props }) {
  const [selectedOption, setSelectedOption] = useState(-1);

  const handleChangeOption = buttonNumber => {
    if (selectedOption == buttonNumber) setSelectedOption(-1);
    else {
      setSelectedOption(buttonNumber);
    }
  };

  function closeModal() {
    document.getElementById('customModal').style.display = 'none';
  }

  function showModal() {
    document.getElementById('customModal').style.display = 'flex';
  }

  return (
    <>
      <div id="customModal" className="custom-modal custom-modal-previewing">
        <div className="modal-content modal-preview">
          <span className="close-btn" onClick={closeModal}>
            &times;
          </span>

          <ImageContainer selectedOption={selectedOption}/>
          <UserOptions handleChangeOption={handleChangeOption} selectedOption={selectedOption} />

        </div>
      </div>
      <button onClick={showModal}>SAM Segmentation</button>
    </>
  );
}

/*
      <div id="home">
        <ImageContainer selectedOption={selectedOption}/>
        <UserOptions handleChangeOption={handleChangeOption} selectedOption={selectedOption} />
      </div>
*/

export default App;
