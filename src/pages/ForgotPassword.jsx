import React, { useEffect, useLayoutEffect, useState } from 'react';
import { resetPassword } from '../firebase';
import AppHelmet from '../components/AppHelmet';
import { NavLink } from 'react-router-dom';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        resetPassword(email, setSuccess, setError, setLoading);
    }

    useEffect(() => {
        error && setTimeout(() => setError(null), 5000);
        success && setTimeout(() => setSuccess(null), 8000);
    }, [error, success]);

    useLayoutEffect(() => {
        window.scrollTo(0, 0)
    });

    return (
        <div className='auth-container'>
            <AppHelmet title={"Reset Password"} location={'/forgot-password'} />
            <div className="auth-glass">
                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email and we'll send you a link to set a new password</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Email address'
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="auth-success">{success}</div>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'SENDING...' : 'SEND RESET LINK'}
                    </button>

                    <div className="auth-footer">
                        <span>Remembered your password?</span>
                        <NavLink to='/login' className="auth-link">Log In &raquo;</NavLink>
                    </div>
                </form>
            </div>
        </div>
    );
};
