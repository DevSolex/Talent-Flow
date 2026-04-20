import React, { useState } from "react";
import "./Reset.css";

function Reset() {
  const [input, setInput] = useState("");

  const handleNumberClick = (num) => {
    setInput((prev) => prev + num);
  };

  const handleDelete = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  return (
    <div className="container1">
      <div className="card">
        <h2>Reset your Password</h2>
        <p>
          Please enter your email or phone number and we will send a verification
          code in the next step to reset your password
        </p>

        <label>Email or Phone Number</label>
        <input
          type="text"
          placeholder="Email or phone number"
          value={input}
          readOnly
        />

        <button className="verify-btn">Send Verification Code</button>
      </div>

      {/* Number Pad */}
      <div className="keypad">
        {[1,2,3,4,5,6,7,8,9].map((num) => (
          <button key={num} onClick={() => handleNumberClick(num)}>
            {num}
          </button>
        ))}

        <button onClick={() => handleNumberClick(0)}>0</button>
        <button className="delete" onClick={handleDelete}>⌫</button>
      </div>
    </div>
  );
}

export default Reset;