import '../styles/forgotPasswordFormComponent.css'

const ForgotPasswordFormComponent = () => {

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Email sent to your inbox.");
    };

    return (
        <div className="forgot-password-container">
            <p className="forgot-password-institute">
                Victoria Institute of Technology
            </p>

            <div className="forgot-password-form">
                <form onSubmit={handleSubmit}>
                    <label>Enter your email:</label>
                    <input type="text" required />

                    <button type="submit" id="forgotResetButton">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordFormComponent;
