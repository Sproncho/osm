import "./AutoComplete.css";
import { useState } from "react";
export default function AutoComplete({
  value,
  setValue,
  placeholder,
  onChange,
  options,
  setOptions,
  customOptions,
  liOnClick
}) {
  const [optionsActive, setOptionsActive] = useState(false);
  return (
    <div className="autoComplete">
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onClick={!optionsActive && setOptionsActive(true)}
        onBlur={() => {
          setTimeout(() => {
            setOptions([]);
          }, 200);
        }}
      />
      <ul>
        {options && !customOptions &&
          options.map((option) => {
            return <li onClick={() => {
                  setValue(option);
                  setOptions([]);
                }}>
                {option}
              </li>
          })}
          {options && customOptions && options.map((option) =>{
            return <li onClick={() =>{
              liOnClick(option)
              setValue(option.text)
              setOptions([])
            }}>{option.text}</li>
          })}
      </ul>
    </div>
  );
}
