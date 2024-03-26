import React from 'react';
import '../styles/UserOptions.css';
import PointSvg from '../assets/point.svg';
import SquareSvg from '../assets/square.svg';

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
        Point
      </button>

      <button
        onClick={() => handleUserChangedOption(1)}
        className={`option ${selectedOption === 1 ? 'active' : ''}`}
      >
        <SquareSvg className="option-icon" />
        Box
      </button>
    </div>
  );
}
