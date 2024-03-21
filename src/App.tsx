import React, { useState } from "react";
import "./App.css";
import { ColorResult, CompactPicker } from "react-color";
import { Field } from "./components";

function App() {
  const [color, setColor] = useState("");
  const [isColorSelection, setIsColorSelection] = useState(false);

  const handleChangeColor = (color: ColorResult) => {
    setColor(color.hex);
    setIsColorSelection((prev) => !prev);
  };

  return (
    <div className="App">
      {isColorSelection && (
        <CompactPicker color={color} onChangeComplete={handleChangeColor} />
      )}

      <Field
        colorBall={color}
        onBallClick={() => {
          setIsColorSelection((prev) => !prev);
        }}
      />
    </div>
  );
}

export default App;
