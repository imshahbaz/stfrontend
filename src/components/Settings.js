import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await api.patch('/api/auth/username', { email, username });
      setSuccessMessage('Settings updated successfully');
      // Update the context with the new username
      login({ ...user, username });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <>
      <main className="container flex-grow-1">
        <div className="py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className="fas fa-cog me-2"></i>Account Settings
                  </h4>
                </div>
                <div className="card-body">
                  {successMessage && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                      <i className="fas fa-check-circle me-2"></i>{successMessage}
                      <button type="button" className="btn-close" data-bs-dismiss="alert" onClick={() => setSuccessMessage('')}></button>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>{errorMessage}
                      <button type="button" className="btn-close" data-bs-dismiss="alert" onClick={() => setErrorMessage('')}></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        <i className="fas fa-envelope me-1"></i>Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        readOnly
                      />
                      <div className="form-text">Email address cannot be changed</div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">
                        <i className="fas fa-user me-1"></i>Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength="3"
                        maxLength="50"
                      />
                      <div className="form-text">Choose a username (3-50 characters)</div>
                    </div>

                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save me-2"></i>Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
