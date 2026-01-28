# React Matra Biometric

A React component for integrating Mantra biometric fingerprint devices (MS100 & MS500) into your applications.

## Features

- ✅ Support for Mantra MS100 and MS500 devices
- ✅ Two modes: Verify (capture fingerprint) and Login (verify against stored template)
- ✅ Real-time device connection status
- ✅ Beautiful UI with Reactstrap components
- ✅ Comprehensive error handling
- ✅ TypeScript support
- ✅ Easy integration

## Installation

```bash
npm install @binarycode/react-matra
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-dom axios reactstrap sweetalert2 bootstrap
```

## Usage

### Basic Setup

First, import Bootstrap CSS in your main file:

```javascript
import 'bootstrap/dist/css/bootstrap.min.css';
```

### Verify Mode (Capture Fingerprint)

```jsx
import React, { useState } from 'react';
import { MatraFingerPrint } from '@binarycode/react-matra';

function App() {
  const [fingerprintData, setFingerprintData] = useState(null);

  const handleFingerprintCapture = (data) => {
    console.log('Captured fingerprint:', data);
    setFingerprintData(data);
    
    // Data includes:
    // - BitmapData: Base64 image
    // - IsoTemplate: ISO fingerprint template
    // - selectedFingerCode: e.g., "L1", "R2"
    // - selectedFingerText: e.g., "Left Thumb"
    // - Quality: Quality percentage
    // - deviceType: "MS100" or "MS500"
  };

  return (
    <div className="container mt-5">
      <MatraFingerPrint
        action="verify"
        fingerData={handleFingerprintCapture}
        MS100_URL="https://localhost:8003/mfs100/"
        MS500_URL="http://localhost:8030/morfinauth/"
      />
    </div>
  );
}
```

### Login Mode (Verify Against Template)

```jsx
import React from 'react';
import { MatraFingerPrint } from '@binarycode/react-matra';
import axios from 'axios';

function LoginPage() {
  // Function to fetch user's stored biometric data
  const fetchUserBiometricData = async (formData) => {
    try {
      const response = await axios.post('/api/user/biometric', {
        username: formData.username
      });
      
      return {
        status: true,
        data: {
          data: {
            iso_template: response.data.isoTemplate,
            // ... other user data
          }
        }
      };
    } catch (error) {
      console.error('Error fetching biometric data:', error);
      return { status: false };
    }
  };

  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData);
    // Store auth token, redirect user, etc.
    localStorage.setItem('authToken', userData.data.token);
    window.location.href = '/dashboard';
  };

  const handleFingerprintData = (data) => {
    console.log('Fingerprint verification result:', data);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <MatraFingerPrint
            action="login"
            fingerData={handleFingerprintData}
            fetchUserBiometricData={fetchUserBiometricData}
            onLoginSuccess={handleLoginSuccess}
            MS100_URL="https://localhost:8003/mfs100/"
            MS500_URL="http://localhost:8030/morfinauth/"
          />
        </div>
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `fingerData` | `function` | Yes | - | Callback function that receives captured fingerprint data |
| `action` | `string` | No | `'verify'` | Mode: `'verify'` (capture) or `'login'` (verify against template) |
| `fetchUserBiometricData` | `function` | Conditional | - | Required when `action='login'`. Function to fetch user's stored biometric template |
| `onLoginSuccess` | `function` | No | - | Callback when login is successful (only for `action='login'`) |
| `MS100_URL` | `string` | No | `'https://localhost:8003/mfs100/'` | Base URL for Mantra MS100 device service |
| `MS500_URL` | `string` | No | `'http://localhost:8030/morfinauth/'` | Base URL for Mantra MS500 device service |

## Device Setup

### Prerequisites

1. **Install Mantra Device Driver**
   - Download and install the appropriate driver for your device from [Mantra's website](https://www.mantratec.com)
   - MS100: Install RD Service
   - MS500: Install MorphoAuth Service

2. **Verify Device Service is Running**
   - MS100 should be accessible at `https://localhost:8003/mfs100/`
   - MS500 should be accessible at `http://localhost:8030/morfinauth/`

3. **SSL Certificate (for MS100)**
   - The MS100 service uses HTTPS with a self-signed certificate
   - You may need to accept the certificate in your browser first

### Testing Device Connection

Open your browser and navigate to:
- MS100: `https://localhost:8003/mfs100/info`
- MS500: `http://localhost:8030/morfinauth/info`

You should see device information in JSON format.

## API Response Structure

### Captured Fingerprint Data

```javascript
{
  ErrorCode: "0",
  ErrorDescription: "Success",
  BitmapData: "base64_encoded_image...",
  IsoTemplate: "base64_encoded_template...",
  Quality: 85,
  selectedFingerCode: "L1",
  selectedFingerText: "👍 Left Thumb (L1)",
  deviceType: "MS100",
  capturedAt: "2025-01-28T10:30:00.000Z"
}
```

### Error Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| -1 | Device not connected |
| -1140 | Capture timeout |
| Other | See Mantra documentation |

## Advanced Usage

### Custom Styling

The component uses Reactstrap and Bootstrap classes. You can override styles:

```jsx
<div className="custom-biometric-wrapper">
  <MatraFingerPrint
    action="verify"
    fingerData={handleCapture}
  />
</div>
```

```css
.custom-biometric-wrapper .card {
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Handling Multiple Fingerprints

```jsx
function EnrollmentForm() {
  const [fingerprints, setFingerprints] = useState([]);

  const handleCapture = (data) => {
    setFingerprints(prev => [...prev, data]);
  };

  const submitEnrollment = async () => {
    await axios.post('/api/user/enroll', {
      fingerprints: fingerprints
    });
  };

  return (
    <>
      <MatraFingerPrint action="verify" fingerData={handleCapture} />
      <button onClick={submitEnrollment}>Submit Enrollment</button>
    </>
  );
}
```

## Troubleshooting

### Device Not Detected

1. Verify the device service is running
2. Check if the device is properly connected via USB
3. Try restarting the device service
4. Ensure correct URL configuration

### SSL Certificate Issues (MS100)

If you see SSL warnings:
1. Navigate to `https://localhost:8003/mfs100/info`
2. Accept the certificate warning
3. Refresh your application

### CORS Issues

If running in development:
```javascript
// Add to your dev server configuration
proxy: {
  '/mfs100': {
    target: 'https://localhost:8003',
    secure: false,
    changeOrigin: true
  }
}
```

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ May require additional certificate configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Support

For issues and questions:
- GitHub Issues: [https://github.com/yourusername/react-matra-biometric/issues](https://github.com/yourusername/react-matra-biometric/issues)
- Email: your.email@example.com

## Changelog

### 1.0.0 (2025-01-28)
- Initial release
- Support for MS100 and MS500 devices
- Verify and Login modes
- Real-time device status
