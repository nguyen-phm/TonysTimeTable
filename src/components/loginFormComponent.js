import '../styles/loginFormComponent.css';
import VITLogo from '../assets/VITLogo.png'
import { Link } from "react-router-dom";

const LoginFormComponent = () => {
    return (
        <div className="login-form-container">
            <form className="login-form">
                <label>Username:</label>
                <input type="text" required />

                <label>Password:</label>
                <input type="password" required />

                <div className="login-checkbox-container">
                    <label htmlFor="login-remember-me"> Remember me</label>
                    <input type="checkbox" id="login-remember-me" />
                </div>

                <div className="login-forgot-password">
                    <Link to="/forgot-password">
                        {"Forgot Password?"}
                    </Link>
                </div>

                <button type="submit">Login</button>

                <div className="login-sign-up">
                    <p>Don't have an account?</p>
                    <Link to="/sign-up">
                        {"Register"}
                    </Link>
                </div>

            </form>

            <div className="login-hero-image">
                <img src={VITLogo} alt="VIT Logo" />
            </div>
        </div>
    );
};

export default LoginFormComponent;
