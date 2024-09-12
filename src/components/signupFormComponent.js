import '../styles/signupFormComponent.css';

const SignupFormComponent = () => {
    return (
        <div className="signup-form-container">
            <p className="signup-institute">
                Victoria Institute of Technology
            </p>

            <div className="signup-form">
                <form>
                    <label>First name:</label>
                    <input type="text" required />

                    <label>Last name:</label>
                    <input type="text" required />

                    <label>Email:</label>
                    <input type="text" required />

                    <label>Password &#40;6 or more&#41;:</label>
                    <input type="password" required />

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
