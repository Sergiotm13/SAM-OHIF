import React from 'react';
import '../styles/UserOptions.css';
import SquareSvg from '../assets/box-icon.svg';
import EraseSvg from '../assets/erase-icon.svg';
import SegmentSvg from '../assets/segmenta-icon.svg';
import PositivePointSvg from '../assets/pp-icon.svg';
import NegativePointSvg from '../assets/np-icon.svg';
import ConfigSvg from '../assets/config.svg';

export default function UserOptions({
  handleChangeOption,
  selectedOption,
  handleChangeModel,
  segment,
  toggleMask,
  handleToggleMask,
  handleChangeBoxColor,
  handleChangePointsRadius,
}) {
  const [selectingOptions, setSelectingOptions] = React.useState(false);

  const handleUserChangedOption = (opt: number) => {
    console.log('User changed option:', opt);
    handleChangeOption(opt);
  };

  const handleUserChangedModel = model => {
    console.log(model);
    handleChangeModel(model);
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

      <button onClick={() => setSelectingOptions(!selectingOptions)} className="option">
        <ConfigSvg className="option-icon" />
      </button>
      {selectingOptions && (
        <div id="configuration-container">
          <div className="sam-model-container">
            <label htmlFor="sam-model-select">SAM model</label>
            <select name="sam-model" id="sam-model-select" onChange={handleChangeModel}>
              <option value="Standard">Standard</option>
              <option value="HuggingFace">HuggingFace</option>
              <option value="MiSAM">MiSAM</option>
            </select>
          </div>
          <div className="box-color-container">
            <label htmlFor="box-color">Box color</label>
            <input
              type="color"
              id="box-color"
              name="box-color"
              onChange={event => handleChangeBoxColor(event.target.value)}
            />
          </div>
          <div className="points-radius-container">
            <label htmlFor="points-radius">Points radius (in pixels)</label>
            <input
              type="number"
              id="points-radius"
              name="points-radius"
              onChange={event => handleChangePointsRadius(event.target.value)}
            />
          </div>
        </div>
      )}

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
