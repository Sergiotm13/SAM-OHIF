import { StylesConfig } from 'react-select';

export const darkThemeStyles: StylesConfig = {
  // Configuration to make the select component dark themed
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'black',
    color: 'white',
    border: '1px solid white',
    borderRadius: '0',
    boxShadow: 'none',
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isFocused ? 'black' : state.isSelected ? 'white' : 'white',
    backgroundColor: state.isFocused ? 'white' : state.isSelected ? 'black' : 'black',
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: 'white',
  }),
  menu: (provided, state) => ({
    ...provided,
    backgroundColor: 'black',
    color: 'white',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  indicatorSeparator: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
  }),

  clearIndicator: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  placeholder: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  input: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  valueContainer: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  container: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  multiValue: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  multiValueLabel: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  multiValueRemove: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  group: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  groupHeading: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  loadingIndicator: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  noOptionsMessage: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  loadingMessage: (provided, state) => ({
    ...provided,
    color: 'white',
  }),

  menuList: (provided, state) => ({
    ...provided,
    color: 'white',
  }),
};
