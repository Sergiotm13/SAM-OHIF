import React from 'react';
import '../styles/UserOptions.css';
import SquareSvg from '../assets/box-icon.svg';
import EraseSvg from '../assets/erase-icon.svg';
import SegmentSvg from '../assets/segmenta-icon.svg';
import PositivePointSvg from '../assets/pp-icon.svg';
import NegativePointSvg from '../assets/np-icon.svg';

export default function UserOptions({
  handleChangeOption,
  selectedOption,
  setModel,
  segment,
  toggleMask,
  handleToggleMask,
}) {
  const handleUserChangedOption = (opt: number) => {
    console.log('User changed option:', opt);
    handleChangeOption(opt);
  };

  const handleUserChangedModel = model => {
    console.log(model);
    setModel(model);
  };

  return (
    <div id="options">
      <button
        onClick={() => handleUserChangedOption(1)}
        className={`option ${selectedOption === 1 ? 'active' : ''}`}
      >
        <PositivePointSvg className="option-icon" />
        Positive Point
      </button>

      <button
        onClick={() => handleUserChangedOption(0)}
        className={`option ${selectedOption === 0 ? 'active' : ''}`}
      >
        <NegativePointSvg className="option-icon" />
        Negative Point
      </button>

      <button
        onClick={() => handleUserChangedOption(2)}
        className={`option ${selectedOption === 2 ? 'active' : ''}`}
      >
        <SquareSvg className="option-icon" />
        Box
      </button>

      <button onClick={() => handleUserChangedOption(3)} className="option">
        <EraseSvg className="option-icon" />
        Clear screen
      </button>

      <div className="end-options">
        {toggleMask && (
          <button onClick={() => handleToggleMask()} className="option">
            Toggle Mask
          </button>
        )}
        <button onClick={() => segment()} className="option segment-option">
          Segment
          <SegmentSvg className="option-icon" />
        </button>
      </div>
    </div>
  );
}
