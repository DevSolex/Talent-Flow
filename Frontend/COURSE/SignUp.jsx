import React, { useState } from "react";
import "./SignUp.css";
import { FaApple } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { TfiFacebook } from "react-icons/tfi";


const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>
        <p className="subtitle">Start learning with TalentFlow today</p>

        <form>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="user@example.com" />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" placeholder="081 234 567 89" />
          </div>

          <div className="input-group password">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                👁
              </span>
            </div>
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>

          <p className="terms">
            By signing up, you agree to our{" "}
            <span>Terms of service</span> and{" "}
            <span>Privacy Policy</span>
          </p>

          <div className="divider">
            <span></span>
            <p>or sign up with</p>
            <span></span>
          </div>

          <div className="socials">
            <button> <FaApple /></button>
            <button> <FcGoogle /> </button>
            <button><TfiFacebook /></button>
          </div>

          <p className="login">
            Already have an account? <span>Sign Up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;