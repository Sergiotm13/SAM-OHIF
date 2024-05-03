import React from 'react';
import '../styles/UserOptions.css';
import PointSvg from '../assets/point.svg';
import SquareSvg from '../assets/box.svg';
import EraseSvg from '../assets/erase.svg';
import Select from 'react-select';
import { darkThemeStyles } from '../styles/react-select-custom-styles';

export default function UserOptions({ handleChangeOption, selectedOption, setModel, segment }) {
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
      <Select
        className="select-input"
        classNamePrefix="select"
        name="color"
        isSearchable={true}
        options={[
          { value: 'red', label: 'Red' },
          { value: 'green', label: 'Green' },
          { value: 'blue', label: 'Blue' },
        ]}
        styles={darkThemeStyles}
        onChange={e => handleUserChangedModel(e)}
        placeholder="Select SAM model"
      />

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

      <button onClick={() => handleUserChangedOption(3)} className="option">
        <EraseSvg className="option-icon" />
        Clear screen
      </button>

      <button onClick={() => segment()} className="option">
        <EraseSvg className="option-icon" />
        Segment
      </button>
    </div>
  );
}
