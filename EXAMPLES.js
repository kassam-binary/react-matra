// Example 1: Basic Fingerprint Capture (Verify Mode)
import React, { useState } from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';
import 'bootstrap/dist/css/bootstrap.min.css';

export function BasicCaptureExample() {
  const [capturedData, setCapturedData] = useState(null);

  const handleCapture = (data) => {
    console.log('Fingerprint captured:', data);
    setCapturedData(data);
    
    // You can now send this data to your backend
    // sendToBackend(data);
  };

  return (
    <div className="container">
      <h2>Fingerprint Capture</h2>
      <MatraFingerPrint
        action="verify"
        fingerData={handleCapture}
      />
      
      {capturedData && (
        <div className="mt-3">
          <h4>Captured Data:</h4>
          <pre>{JSON.stringify(capturedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// Example 2: Fingerprint Login
import React from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';
import axios from 'axios';

export function LoginExample() {
  // Fetch user's stored biometric template
  const fetchUserBiometricData = async (formData) => {
    try {
      const response = await axios.post('https://your-api.com/api/user/biometric', {
        username: formData.username
      });
      
      return {
        status: true,
        data: {
          data: {
            iso_template: response.data.isoTemplate
          }
        }
      };
    } catch (error) {
      console.error('Error:', error);
      return { status: false };
    }
  };

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    console.log('Login successful!');
    localStorage.setItem('authToken', userData.data.token);
    window.location.href = '/dashboard';
  };

  const handleFingerprintData = (data) => {
    if (data.matched) {
      console.log('Fingerprint matched!');
    } else {
      console.log('Fingerprint did not match');
    }
  };

  return (
    <div className="container">
      <h2>Biometric Login</h2>
      <MatraFingerPrint
        action="login"
        fingerData={handleFingerprintData}
        fetchUserBiometricData={fetchUserBiometricData}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

// Example 3: User Enrollment (Multiple Fingerprints)
import React, { useState } from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';
import { Button, Alert } from 'reactstrap';
import axios from 'axios';

export function EnrollmentExample() {
  const [fingerprints, setFingerprints] = useState([]);
  const [enrollmentStep, setEnrollmentStep] = useState(1);
  const maxFingerprints = 2; // Capture 2 different fingers

  const handleCapture = (data) => {
    if (data.IsoTemplate) {
      setFingerprints(prev => [...prev, {
        fingerCode: data.selectedFingerCode,
        fingerName: data.selectedFingerText,
        template: data.IsoTemplate,
        quality: data.Quality
      }]);
      
      if (enrollmentStep < maxFingerprints) {
        setEnrollmentStep(prev => prev + 1);
      }
    }
  };

  const submitEnrollment = async () => {
    try {
      await axios.post('https://your-api.com/api/user/enroll', {
        userId: '12345',
        fingerprints: fingerprints
      });
      
      alert('Enrollment successful!');
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    }
  };

  const resetEnrollment = () => {
    setFingerprints([]);
    setEnrollmentStep(1);
  };

  return (
    <div className="container">
      <h2>User Enrollment</h2>
      
      <Alert color="info">
        Step {enrollmentStep} of {maxFingerprints}: Capture fingerprint
      </Alert>

      {fingerprints.length < maxFingerprints && (
        <MatraFingerPrint
          action="verify"
          fingerData={handleCapture}
        />
      )}

      {fingerprints.length > 0 && (
        <div className="mt-3">
          <h4>Captured Fingerprints:</h4>
          {fingerprints.map((fp, index) => (
            <Alert key={index} color="success">
              {index + 1}. {fp.fingerName} - Quality: {fp.quality}%
            </Alert>
          ))}
        </div>
      )}

      {fingerprints.length === maxFingerprints && (
        <div className="mt-3">
          <Button color="primary" onClick={submitEnrollment} className="me-2">
            Complete Enrollment
          </Button>
          <Button color="secondary" onClick={resetEnrollment}>
            Start Over
          </Button>
        </div>
      )}
    </div>
  );
}

// Example 4: With Custom Device URLs
import React from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';

export function CustomDeviceURLExample() {
  const handleCapture = (data) => {
    console.log('Captured:', data);
  };

  return (
    <div className="container">
      <h2>Custom Device Configuration</h2>
      <MatraFingerPrint
        action="verify"
        fingerData={handleCapture}
        MS100_URL="https://192.168.1.100:8003/mfs100/"
        MS500_URL="http://192.168.1.100:8030/morfinauth/"
      />
    </div>
  );
}

// Example 5: With Error Handling
import React, { useState } from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';
import { Alert } from 'reactstrap';

export function ErrorHandlingExample() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCapture = (data) => {
    if (data.ErrorCode && data.ErrorCode !== "0") {
      setError(data.ErrorDescription || 'Capture failed');
      setSuccess(false);
    } else if (data.IsoTemplate) {
      setError(null);
      setSuccess(true);
      
      // Process successful capture
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="container">
      <h2>Fingerprint Capture with Error Handling</h2>
      
      {error && (
        <Alert color="danger" toggle={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert color="success">
          Fingerprint captured successfully!
        </Alert>
      )}

      <MatraFingerPrint
        action="verify"
        fingerData={handleCapture}
      />
    </div>
  );
}

// Example 6: Complete React Application
import React, { useState } from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [mode, setMode] = useState('verify'); // 'verify' or 'login'
  const [data, setData] = useState(null);

  return (
    <Container className="mt-5">
      <Row>
        <Col md={{ size: 8, offset: 2 }}>
          <Card>
            <CardBody>
              <h2 className="mb-4">Biometric Authentication Demo</h2>
              
              <div className="mb-3">
                <button 
                  className={`btn ${mode === 'verify' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                  onClick={() => setMode('verify')}
                >
                  Capture Mode
                </button>
                <button 
                  className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setMode('login')}
                >
                  Login Mode
                </button>
              </div>

              <MatraFingerPrint
                action={mode}
                fingerData={(capturedData) => {
                  console.log('Data:', capturedData);
                  setData(capturedData);
                }}
                fetchUserBiometricData={async (formData) => {
                  // Mock implementation - replace with real API call
                  return {
                    status: true,
                    data: {
                      data: {
                        iso_template: 'mock_template_here'
                      }
                    }
                  };
                }}
              />

              {data && (
                <div className="mt-4">
                  <h5>Captured Data:</h5>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
