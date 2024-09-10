import '../styles/formComponent.css';
import VITLogo from '../assets/VITLogo.png'

const formComponent = () => {
    return (
        <div className="form">
            <form>
                <label>Username:</label>
                <input type="text" required />

                <label>Password:</label>
                <input type="password" required />

                <div className="checkbox-container">
                    <label for="remember-me"> Remember me</label>
                    <input type="checkbox" id="remember-me" />
                </div>

                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Forgot Password?</a>
                <button>Login</button>

                <div className="sign-up">
                    <p>Don't have an account?</p>
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Register</a>
                </div>
            </form>


            <div className="hero-image">
                <img src={VITLogo} /> 
            </div>
        </div>
    );
};

export default formComponent;