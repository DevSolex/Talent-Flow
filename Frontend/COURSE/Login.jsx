import React, { useState } from "react";
import "./Login.css";
import { FaApple } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { TfiFacebook } from "react-icons/tfi";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="container">
            <div className="card">
                {/* Logo */}
                <div className="logo">
                    <span className="logo-icon"> <img src="./images/logo.jpg" /> </span>

                </div>

                <h2>Welcome Back!</h2>

                <form>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="johndoe@gmail.com" />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                            />
                            <span onClick={() => setShowPassword(!showPassword)}>
                                👁
                            </span>
                        </div>

                        <div className="password-options">
                            
                            <label className="remember">
                                <input type="checkbox" />Keep me logged in
                            </label>
                            <span className="forgot">Forgot password?</span>
                        </div>
                    </div>

                    <button className="login-btn">Log In</button>

                    <div className="divider">
                        <span></span>
                        <p>or sign in with</p>
                        <span></span>
                    </div>

                    <div className="socials">
                        <button> <FaApple /></button>
                        <button> <FcGoogle /> </button>
                        <button><TfiFacebook /></button>
                    </div>

                    <p className="signup">
                        New to TalentFlow? <span>Sign Up</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;