import axios from "axios";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    Card, CardBody, CardFooter, CardHeader, Spinner,
    Badge, Button, Alert, ButtonGroup, Input, Label
} from "reactstrap";
import Swal from "sweetalert2";

const MatraFingerPrint = ({ 
    fingerData, 
    action = 'verify',
    onLoginSuccess,
    fetchUserBiometricData,
    MS100_URL = 'https://localhost:8003/mfs100/',
    MS500_URL = 'http://localhost:8030/morfinauth/'
}) => {
    // State management
    const [matraInfo, setMatraInfo] = useState({});
    const [fingerResponse, setFingerResponse] = useState({});
    const [loading, setLoading] = useState(false);
    const [warningMessage, setWarningMessage] = useState('Choose a finger before proceeding');
    const [deviceType, setDeviceType] = useState('MS100'); // MS100 or MS500
    const [deviceStatus, setDeviceStatus] = useState('unknown'); // connected, disconnected, unknown
    const [error, setError] = useState(null);
    
    // Form state
    const [form, setForm] = useState({
        username: '',
        finger_code: '',
        selectedFingerCode: '',
        selectedFingerText: ''
    });
    
    const [formErrors, setFormErrors] = useState({
        username: action === 'login' ? 'Username is required' : null,
        finger_code: action === 'verify' ? 'Fingerprint is required' : null
    });

    // Refs
    const fingerOptions = useRef();

    /**
     * Get device configuration
     */
    const getDeviceConfig = useCallback(() => {
        const configs = {
            MS100: {
                baseUrl: MS100_URL,
                name: 'Mantra MS100',
                quality: 60,
                timeout: 10
            },
            MS500: {
                baseUrl: MS500_URL,
                name: 'Mantra MS500',
                quality: 60,
                timeout: 10
            }
        };

        return configs[deviceType];
    }, [deviceType, MS100_URL, MS500_URL]);

    /**
     * Check device status on mount and device change
     */
    useEffect(() => {
        checkDeviceStatus();
    }, [deviceType]);

    /**
     * Check if device is connected
     */
    const checkDeviceStatus = useCallback(async () => {
        const config = getDeviceConfig();
        
        try {
            const response = await axios.get(
                `${config.baseUrl}info`,
                { 
                    params: { Key: "info" },
                    timeout: 3000 
                }
            );

            if (response) {
                setDeviceStatus('connected');
                setMatraInfo(response.data || response);
                setError(null);
            } else {
                setDeviceStatus('disconnected');
            }
        } catch (error) {
            console.error('Device check error:', error);
            setDeviceStatus('disconnected');
            setError(`${config.name} device not detected. Please ensure the device is connected and the service is running.`);
        }
    }, [getDeviceConfig]);

    /**
     * POST request to Matra device
     */
    const PostMFS100Client = useCallback(async (method, jsonData) => {
        const config = getDeviceConfig();
        
        try {
            const response = await axios.post(
                `${config.baseUrl}${method}`,
                jsonData,
                {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    responseType: 'json',
                    timeout: config.timeout * 1000
                }
            );

            return response.data || response;
        } catch (error) {
            console.error('Matra device error:', error);
            throw error;
        }
    }, [getDeviceConfig]);

    /**
     * Handle form input changes
     */
    const onChange = useCallback(({ name, e }) => {
        const value = e.target.value;
        
        if (name === "finger_code") {
            const selectedText = e.target.options[e.target.selectedIndex].text;

            setForm((prev) => ({
                ...prev,
                [name]: value,
                selectedFingerCode: value,
                selectedFingerText: selectedText,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        // Validation logic
        if (value !== "") {
            setFormErrors((prev) => ({ ...prev, [name]: null }));
        } else {
            setFormErrors((prev) => ({ ...prev, [name]: "This field is required" }));
        }
    }, []);

    /**
     * Handle finger selection change
     */
    const onChangeSelectedFinger = useCallback((e) => {
        const value = e.target.value;
        const text = e.target.options[e.target.selectedIndex].text;
        
        // Clear previous capture
        setFingerResponse({});
        setError(null);
        
        // Update warning message
        if (value) {
            setWarningMessage(`Selected: ${text} - Ready to capture`);
        } else {
            setWarningMessage('Choose a finger before proceeding');
        }
    }, []);

    /**
     * Check if fingerprint matches
     */
    const isFingerMatch = useCallback((matchResponse) => {
        return (
            matchResponse &&
            matchResponse.ErrorCode === "0" &&
            matchResponse.Status === true
        );
    }, []);

    /**
     * Show validation message
     */
    const showValidationMessage = useCallback((status, message) => {
        Swal.fire({
            title: status,
            icon: status,
            text: message,
            confirmButtonText: 'OK'
        });
    }, []);

    /**
     * Handle login verification
     */
    const handleLogin = useCallback(async (capturedRes) => {
        try {
            if (!fetchUserBiometricData) {
                throw new Error('fetchUserBiometricData function is required for login action');
            }

            const userDataRes = await fetchUserBiometricData(form);
            setLoading(false);

            if (userDataRes?.status && userDataRes?.data?.data?.iso_template) {
                const verifyResult = await PostMFS100Client("match", {
                    ProbTemplate: capturedRes.IsoTemplate,
                    GalleryTemplate: userDataRes.data.data.iso_template,
                    BioType: "FMR",
                });

                if (isFingerMatch(verifyResult)) {
                    setWarningMessage("Fingerprint matched successfully");
                    fingerData({ matched: true, ...capturedRes });
                    
                    if (onLoginSuccess) {
                        onLoginSuccess(userDataRes);
                    }
                    
                    Swal.fire({
                        title: 'Success',
                        icon: 'success',
                        text: 'Login successful!',
                        confirmButtonText: 'OK'
                    });
                } else {
                    const resMessage = verifyResult?.ErrorCode === "-1140"
                        ? verifyResult?.ErrorDescription || "Capture timed out"
                        : "Fingerprint did not match";

                    showValidationMessage("error", resMessage);
                    fingerData({ matched: false, ...capturedRes });
                }
            } else {
                showValidationMessage("error", "User biometric data not found");
            }
        } catch (error) {
            setLoading(false);
            console.error("Verification error:", error);
            showValidationMessage("error", error.message || "Error during fingerprint verification");
        }
    }, [form, PostMFS100Client, isFingerMatch, fingerData, showValidationMessage, fetchUserBiometricData, onLoginSuccess]);

    /**
     * Capture fingerprint
     */
    const CaptureFinger = useCallback(async () => {
        // Validation checks
        if (action === 'verify' && !fingerOptions.current?.value) {
            setError('Please select a finger first');
            return;
        }

        if (action === 'login' && (!form.username || form.username.trim() === '')) {
            setError('Please enter username first');
            return;
        }

        setLoading(true);
        setError(null);
        fingerData({});
        setFingerResponse({});
        setWarningMessage('Place your finger on the sensor device');

        const config = getDeviceConfig();

        try {
            const response = await PostMFS100Client('capture', {
                Quality: config.quality,
                TimeOut: config.timeout
            });

            const errorCode = parseInt(response.ErrorCode);

            if (errorCode === 0) {
                setForm(prev => ({
                    ...prev,
                    ...response
                }));

                if (action === 'login') {
                    await handleLogin(response);
                } else {
                    setLoading(false);
                    
                    const captureData = {
                        ...response,
                        selectedFingerCode: fingerOptions.current?.value || '',
                        selectedFingerText: fingerOptions.current?.options?.[fingerOptions.current.selectedIndex]?.text || '',
                        deviceType: deviceType,
                        capturedAt: new Date().toISOString()
                    };

                    setFingerResponse(captureData);
                    fingerData(captureData);
                    setWarningMessage('Fingerprint captured successfully!');
                    setError(null);
                }
            } else {
                setLoading(false);
                const errorMsg = response.ErrorDescription || `Failed to capture fingerprint (Error code: ${errorCode})`;
                setError(errorMsg);
                setWarningMessage('Capture failed - Please try again');
            }
        } catch (error) {
            console.error('Capture error:', error);
            setLoading(false);
            setError(`Failed to capture fingerprint. ${config.name} device may not be connected.`);
            setWarningMessage('Capture failed - Check device connection');
        }
    }, [action, form, getDeviceConfig, PostMFS100Client, deviceType, fingerData, handleLogin]);

    /**
     * Switch device type
     */
    const switchDeviceType = useCallback((type) => {
        setDeviceType(type);
        setFingerResponse({});
        setForm(prev => ({ ...prev, BitmapData: undefined }));
        setError(null);
        setWarningMessage('Choose a finger before proceeding');
        
        if (fingerOptions.current) {
            fingerOptions.current.value = '';
        }
    }, []);

    /**
     * Get status badge color
     */
    const getStatusColor = () => {
        switch (deviceStatus) {
            case 'connected':
                return 'success';
            case 'disconnected':
                return 'danger';
            default:
                return 'warning';
        }
    };

    /**
     * Get status text
     */
    const getStatusText = () => {
        switch (deviceStatus) {
            case 'connected':
                return 'Connected';
            case 'disconnected':
                return 'Disconnected';
            default:
                return 'Checking...';
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                        <i className="ri-fingerprint-line me-2"></i>
                        Biometric {action === 'login' ? 'Login' : 'Scanner'}
                    </h6>
                    <Badge color={getStatusColor()} className="px-2 py-1">
                        <i className={`ri-${deviceStatus === 'connected' ? 'checkbox-circle' : 'close-circle'}-line me-1`}></i>
                        {getStatusText()}
                    </Badge>
                </div>

                {/* Device Type Selector */}
                <div className="mb-3">
                    <small className="text-muted d-block mb-2">Select Device Type:</small>
                    <ButtonGroup size="sm" className="w-100">
                        <Button
                            color={deviceType === 'MS100' ? 'primary' : 'light'}
                            onClick={() => switchDeviceType('MS100')}
                            active={deviceType === 'MS100'}
                        >
                            <i className="ri-fingerprint-line me-1"></i>
                            Mantra MS100
                        </Button>
                        <Button
                            color={deviceType === 'MS500' ? 'primary' : 'light'}
                            onClick={() => switchDeviceType('MS500')}
                            active={deviceType === 'MS500'}
                        >
                            <i className="ri-fingerprint-fill me-1"></i>
                            Mantra MS500
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Username Input (Login Mode Only) */}
                {action === 'login' && (
                    <div className="mb-3">
                        <Label htmlFor="username" className="form-label">
                            <i className="ri-user-line me-1"></i>
                            Username <span className="text-danger">*</span>
                        </Label>
                        <Input
                            name="username"
                            className="form-control form-control-sm bg-light border-0"
                            placeholder="Enter username"
                            type="text"
                            onChange={(e) => onChange({ name: 'username', e })}
                            value={form.username}
                            valid={formErrors.username === null && form.username !== ''}
                            invalid={formErrors.username !== null}
                        />
                        {formErrors.username && (
                            <small className="text-danger">{formErrors.username}</small>
                        )}
                    </div>
                )}

                {/* Finger Selection (Verify Mode Only) */}
                {action === 'verify' && (
                    <div className="mb-3">
                        <Label htmlFor="finger_code" className="form-label">
                            <i className="ri-hand-finger-line me-1"></i>
                            Select Finger <span className="text-danger">*</span>
                        </Label>
                        <Input
                            name="finger_code"
                            className="form-control form-control-sm bg-light border-0"
                            type="select"
                            onChange={(e) => {
                                onChange({ name: 'finger_code', e });
                                onChangeSelectedFinger(e);
                            }}
                            value={form.finger_code}
                            valid={formErrors.finger_code === null && form.finger_code !== ''}
                            invalid={formErrors.finger_code !== null}
                            innerRef={fingerOptions}
                        >
                            <option value="">-- Select finger --</option>
                            <optgroup label="Left Hand">
                                <option value="L1">👍 Left Thumb (L1)</option>
                                <option value="L2">☝️ Left Index (L2)</option>
                                <option value="L3">🖕 Left Middle (L3)</option>
                                <option value="L4">💍 Left Ring (L4)</option>
                                <option value="L5">🤙 Left Pinky (L5)</option>
                            </optgroup>
                            <optgroup label="Right Hand">
                                <option value="R1">👍 Right Thumb (R1)</option>
                                <option value="R2">☝️ Right Index (R2)</option>
                                <option value="R3">🖕 Right Middle (R3)</option>
                                <option value="R4">💍 Right Ring (R4)</option>
                                <option value="R5">🤙 Right Pinky (R5)</option>
                            </optgroup>
                        </Input>
                        {formErrors.finger_code && (
                            <small className="text-danger">{formErrors.finger_code}</small>
                        )}
                    </div>
                )}

                {/* Status Message */}
                <Alert
                    color={(fingerResponse?.BitmapData || form?.BitmapData) ? 'success' : error ? 'danger' : 'info'}
                    className="mb-3"
                    fade={false}
                >
                    <i className={`ri-${(fingerResponse?.BitmapData || form?.BitmapData) ? 'checkbox-circle' : error ? 'error-warning' : 'information'}-line me-2`}></i>
                    {warningMessage}
                </Alert>

                {/* Error Display */}
                {error && (
                    <Alert color="danger" className="mb-0">
                        <i className="ri-error-warning-line me-2"></i>
                        {error}
                        <Button
                            color="danger"
                            size="sm"
                            outline
                            className="ms-2"
                            onClick={checkDeviceStatus}
                        >
                            <i className="ri-refresh-line me-1"></i>
                            Retry
                        </Button>
                    </Alert>
                )}
            </CardHeader>

            <CardBody>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '220px' }}>
                    {loading ? (
                        <div className="text-center">
                            <Spinner color="primary" size="lg" />
                            <div className="mt-3 text-muted">
                                <i className="ri-fingerprint-line fs-1"></i>
                                <div>
                                    {action === 'login' ? 'Verifying fingerprint...' : 'Capturing fingerprint...'}
                                </div>
                                <small>Please keep your finger on the sensor</small>
                            </div>
                        </div>
                    ) : (fingerResponse?.BitmapData || form?.BitmapData) ? (
                        <div className="text-center">
                            <img
                                className="border border-success rounded"
                                src={`data:image/bmp;base64,${fingerResponse.BitmapData || form.BitmapData}`}
                                id="imgFinger"
                                width="145px"
                                height="188px"
                                alt="Fingerprint"
                                style={{ objectFit: 'contain' }}
                            />
                            <div className="mt-2">
                                <Badge color="success" className="px-3">
                                    <i className="ri-checkbox-circle-line me-1"></i>
                                    {fingerResponse.selectedFingerText || form.selectedFingerText || 'Captured'}
                                </Badge>
                            </div>
                            {(fingerResponse.Quality || form.Quality) && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        Quality: <strong>{fingerResponse.Quality || form.Quality}%</strong>
                                    </small>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted">
                            <i className="ri-fingerprint-line" style={{ fontSize: '80px', opacity: 0.3 }}></i>
                            <div className="mt-2">No fingerprint captured</div>
                            <small>
                                {action === 'login' ? 'Enter username and click capture' : 'Select a finger and click capture'}
                            </small>
                        </div>
                    )}
                </div>

                {/* Device Info */}
                {matraInfo?.DeviceInfo && (
                    <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted">
                            <strong>Device:</strong> {matraInfo.DeviceInfo.Model || 'Unknown'}
                            {matraInfo.DeviceInfo.SerialNo && ` | S/N: ${matraInfo.DeviceInfo.SerialNo}`}
                        </small>
                    </div>
                )}
            </CardBody>

            <CardFooter className="bg-light">
                <div className="d-grid gap-2">
                    <Button
                        color="primary"
                        onClick={CaptureFinger}
                        disabled={
                            loading || 
                            deviceStatus === 'disconnected' || 
                            (action === 'verify' && !fingerOptions.current?.value) ||
                            (action === 'login' && (!form.username || form.username.trim() === ''))
                        }
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                {action === 'login' ? 'Verifying...' : 'Capturing...'}
                            </>
                        ) : (
                            <>
                                <i className="ri-fingerprint-line me-2"></i>
                                {action === 'login' ? 'Login with Fingerprint' : 'Capture Fingerprint'}
                            </>
                        )}
                    </Button>

                    {(fingerResponse?.BitmapData || form?.BitmapData) && action === 'verify' && (
                        <Button
                            color="secondary"
                            size="sm"
                            outline
                            onClick={() => {
                                setFingerResponse({});
                                setForm(prev => ({ ...prev, BitmapData: undefined }));
                                fingerData({});
                                setWarningMessage('Choose a finger before proceeding');
                            }}
                        >
                            <i className="ri-delete-bin-line me-1"></i>
                            Clear Capture
                        </Button>
                    )}

                    {deviceStatus === 'disconnected' && (
                        <Button
                            color="warning"
                            size="sm"
                            outline
                            onClick={checkDeviceStatus}
                        >
                            <i className="ri-refresh-line me-1"></i>
                            Check Device Connection
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};

export default MatraFingerPrint;
