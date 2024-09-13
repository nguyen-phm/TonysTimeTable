import '../styles/signupFormComponent.css';

const SignupFormComponent = () => {
    return (
        <div className="signup-form-container">
            <p className="signup-institute">
                Victoria Institute of Technology
            </p>

            <div className="signup-form">
                <form>
                    <label>Email:</label>
                    <input type="text" required />

                    <label>Password:</label>
                    <input type="password" required />

                    <label>Confirm Password:</label>
                    <input type="password" required />

                    <ul className="">
                        <li>Password must contain only numbers and letters.</li>
                        <li>Password must contain atleast one symbol</li>
                        <li>Password must be atleast 6 characters long</li>
                    </ul>
    
                    <p className="signup-agreement">
                        By clicking Join now, you agree to VIT's User agreement, Privacy Policy, and Cookie Policy
                    </p>

                    <button type="submit" className="signup-button">
                        <label htmlFor="join-now">Join Now</label>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupFormComponent;
