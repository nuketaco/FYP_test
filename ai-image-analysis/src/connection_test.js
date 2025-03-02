import React, { useState } from 'react';
import './ConnectionTest.css';

function ConnectionTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      // Make sure to replace with your Flask backend URL
      const response = await fetch('http://127.0.0.1:5000');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connection-test">
      <h2>Backend Connection Test</h2>
      <button 
        onClick={testConnection} 
        disabled={loading}
        className="test-button"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {error && (
        <div className="error">
          <h3>Connection Failed</h3>
          <p>{error}</p>
          <div className="troubleshooting">
            <h4>Troubleshooting Tips:</h4>
            <ul>
              <li>Make sure Flask backend is running on port 5000</li>
              <li>Check that CORS is enabled on your Flask backend</li>
              <li>Verify the URL in the fetch request matches your backend</li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </div>
        </div>
      )}

      {result && (
        <div className="success">
          <h3>Connection Successful!</h3>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Message:</strong> {result.message}</p>
          <p><strong>Timestamp:</strong> {result.timestamp}</p>
        </div>
      )}
    </div>
  );
}

export default ConnectionTest;