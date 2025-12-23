import { useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setShowResult(false);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await api.post(`${process.env.REACT_APP_BACKEND_URL}/api/margin/load-from-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setSuccessMessage('CSV data loaded successfully!');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load CSV data');
    } finally {
      setUploading(false);
      setShowResult(true);
    }
  };

  return (
    <>
      <main className="container flex-grow-1">
        <div className="py-5">
          <div className="row mb-4">
            <div className="col-12">
              <h2 className="text-primary mb-4">
                <i className="fas fa-tachometer-alt me-2"></i>Admin Dashboard
              </h2>
            </div>
          </div>

          <div className="row">
            {/* Margin Data Management */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100 shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-upload me-2"></i>Margin Data Management
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">Upload CSV files to load margin data into the system.</p>

                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-3">
                      <label htmlFor="csvFile" className="form-label">
                        <i className="fas fa-file-csv me-1"></i>CSV File
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="csvFile"
                        name="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        required
                      />
                      <div className="form-text">Select a CSV file containing margin data</div>
                    </div>

                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={uploading}>
                        {uploading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload me-2"></i>Upload and Load Data
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {showResult && (
                    <div className="mt-3">
                      {successMessage && (
                        <div className="alert alert-success">
                          <i className="fas fa-check-circle me-2"></i>
                          {successMessage}
                        </div>
                      )}
                      {errorMessage && (
                        <div className="alert alert-danger">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
