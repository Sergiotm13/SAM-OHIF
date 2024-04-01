import React from 'react';
import '../styles/UserOptions.css';
import PointSvg from '../assets/point.svg';
import SquareSvg from '../assets/box.svg';

export default function UserOptions({ handleChangeOption, selectedOption }) {
  const handleUserChangedOption = opt => {
    console.log('User changed option to ' + opt);
    handleChangeOption(opt);
  };

  return (
    <div id="options">
      <button
        onClick={() => handleUserChangedOption(0)}
        className={`option ${selectedOption === 0 ? 'active' : ''}`}
      >
        <PointSvg className="option-icon" />
        Negative Point
      </button>

      <button
        onClick={() => handleUserChangedOption(1)}
        className={`option ${selectedOption === 1 ? 'active' : ''}`}
      >
        <PointSvg className="option-icon" />
        Positive Point
      </button>

      <button
        onClick={() => handleUserChangedOption(2)}
        className={`option ${selectedOption === 2 ? 'active' : ''}`}
      >
        <SquareSvg className="option-icon" />
        Box
      </button>
    </div>
  );
}
