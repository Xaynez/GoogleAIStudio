import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { OnboardingData } from '../../types';
import { User, Mail, Camera, CheckCircle, ShieldCheck, Video, X, AlertTriangle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Smile, Check, RefreshCw, Send } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Step1Props {
  data: OnboardingData;
  updateData: (update: Partial<OnboardingData>) => void;
}

const idTypes = [
    { id: 'driversLicense', name: "Driver's License" },
    { id: 'passport', name: 'Passport' },
    { id: 'nationalId', name: 'National ID' }
];

const livenessInstructions = [
    { dir: 'center', text: 'Ready? Face forward', icon: <Smile size={48} />, voice: 'Please face forward to begin.' },
    { dir: 'up', text: 'Slowly look up', icon: <ArrowUp size={48} />, voice: 'Now, slowly look up.' },
    { dir: 'down', text: 'Slowly look down', icon: <ArrowDown size={48} />, voice: 'Slowly look down.' },
    { dir: 'left', text: 'Slowly look left', icon: <ArrowLeft size={48} />, voice: 'Turn your head to the left.' },
    { dir: 'right', text: 'Slowly look right', icon: <ArrowRight size={48} />, voice: 'And now to the right.' },
    { dir: 'center', text: 'Perfect, hold steady', icon: <Smile size={48} />, voice: 'Perfect. Face forward again.' },
];


const CameraView: React.FC<{
    mode: 'id' | 'selfie';
    onCapture: (dataUrl: string) => void;
    onClose: () => void;
    onSelfieComplete: () => void;
}> = ({ mode, onCapture, onClose, onSelfieComplete }) => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    
    // Selfie Liveness State
    const [livenessStep, setLivenessStep] = useState(-1); // -1: ready, 0-5: instructions, 6: complete
    const [showStepSuccess, setShowStepSuccess] = useState(false);
    const livenessProgress = livenessStep >= 0 ? ((livenessStep + 1) / livenessInstructions.length) * 100 : 0;
    
    const cleanupCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        window.speechSynthesis.cancel();
    }, [stream]);
    
    const setupCamera = useCallback(async () => {
        if (stream) cleanupCamera();
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode === 'selfie' ? 'user' : 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            setError(t('cameraErrorText'));
        }
    }, [mode, stream, cleanupCamera, t]);
    
    useEffect(() => {
        setupCamera();
        return cleanupCamera;
    }, [setupCamera]);
    
    const handleCapture = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
            if (mode === 'selfie') {
                cleanupCamera();
            }
        }
    }, [mode, cleanupCamera]);
    
    useEffect(() => {
        if (mode === 'selfie' && stream && !capturedImage && livenessStep === -1) {
            setTimeout(() => setLivenessStep(0), 1500);
        }
    }, [mode, stream, livenessStep, capturedImage]);

    useEffect(() => {
        if (livenessStep > 0 && livenessStep <= livenessInstructions.length) {
            setShowStepSuccess(true);
            const timer = setTimeout(() => setShowStepSuccess(false), 800);
            return () => clearTimeout(timer);
        }
    }, [livenessStep]);

    useEffect(() => {
        if (mode === 'selfie' && livenessStep >= 0 && livenessStep < livenessInstructions.length) {
            const timer = setTimeout(() => {
                setLivenessStep(s => s + 1);
            }, 3000); 
            return () => clearTimeout(timer);
        } else if (mode === 'selfie' && livenessStep === livenessInstructions.length) {
            const captureTimer = setTimeout(() => {
                handleCapture();
                onSelfieComplete();
            }, 800);
            return () => clearTimeout(captureTimer);
        }
    }, [mode, livenessStep, onSelfieComplete, handleCapture]);
    
    useEffect(() => {
        if (mode !== 'selfie' || !window.speechSynthesis || livenessStep < 0 || capturedImage) return;

        window.speechSynthesis.cancel();
        
        let textToSpeak = '';
        
        if (livenessStep < livenessInstructions.length) {
            textToSpeak = livenessInstructions[livenessStep].voice;
            if (livenessStep === 0) {
                textToSpeak = `Starting liveness check. ${textToSpeak}`;
            }
        } else if (livenessStep === livenessInstructions.length) {
            textToSpeak = 'Verification complete!';
        }

        if (textToSpeak) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }

    }, [livenessStep, mode, capturedImage]);

    const handleRetake = () => {
        setCapturedImage(null);
        if (mode === 'selfie') {
            setLivenessStep(-1);
            setupCamera();
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <button onClick={() => { cleanupCamera(); onClose(); }} className="absolute top-4 right-4 text-white bg-slate-800/50 rounded-full p-2 hover:bg-slate-700">
                <X className="h-6 w-6" />
            </button>

            {capturedImage ? (
                <div className="w-full max-w-2xl flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-white mb-4">{t('cameraViewPreview')}</h3>
                    <img src={capturedImage} alt="Capture preview" className="rounded-lg border-2 border-slate-600 max-h-[60vh] object-contain" />
                    <div className="mt-6 flex gap-4">
                        <button onClick={handleRetake} className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-bold rounded-full text-lg hover:bg-slate-600 transition-transform transform hover:scale-105">
                            <RefreshCw className="h-6 w-6" /> {t('retake')}
                        </button>
                        <button onClick={handleConfirm} className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full text-lg hover:bg-cyan-700 transition-transform transform hover:scale-105">
                            <Send className="h-6 w-6" /> {t('usePhoto')}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden relative border-2 border-slate-700">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        {mode === 'selfie' && <div className="absolute inset-0 flex items-center justify-center flex-col p-4 text-center pointer-events-none">
                            <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-3/4 aspect-[3/4] border-4 border-dashed border-cyan-400/50 rounded-full relative overflow-hidden">
                                     <div className="scan-line"></div>
                                 </div>
                            </div>
                             {showStepSuccess && (
                                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 animate-fade-out-slow">
                                    <CheckCircle className="h-32 w-32 text-white animate-scale-in" />
                                </div>
                            )}
                            {!showStepSuccess && livenessStep > -1 && livenessStep < livenessInstructions.length &&
                                <div className="bg-black/50 p-4 rounded-lg animate-fade-in">
                                    <div className="text-cyan-400 w-16 h-16 mx-auto flex items-center justify-center">{livenessInstructions[livenessStep].icon}</div>
                                    <p className="text-white text-2xl font-bold mt-2">{livenessInstructions[livenessStep].text}</p>
                                </div>
                            }
                        </div>}
                        {error && <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white p-4 text-center">
                            <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                            <h3 className="text-xl font-bold">{t('cameraErrorTitle')}</h3>
                            <p>{error}</p>
                        </div>}
                    </div>

                    {mode === 'id' && !error &&
                        <button onClick={handleCapture} className="mt-6 flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full text-lg hover:bg-cyan-700 transition-transform transform hover:scale-105">
                            <Camera className="h-6 w-6" /> {t('capture')}
                        </button>
                    }
                    {mode === 'selfie' && livenessStep > -1 &&
                        <div className="mt-6 w-full max-w-md">
                            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${livenessProgress}%`}}/>
                            </div>
                        </div>
                    }
                </>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export const Step1Verification: React.FC<Step1Props> = ({ data, updateData }) => {
    const { t } = useTranslation();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraFor, setCameraFor] = useState<'idFrontPhoto' | 'idBackPhoto' | null>(null);
    const [isSelfieMode, setIsSelfieMode] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);

    const needsBackPhoto = data.idType === 'driversLicense' || data.idType === 'nationalId';

    const handleCapture = (dataUrl: string) => {
        if (cameraFor) {
            updateData({ [cameraFor]: dataUrl });
            setIsCameraOpen(false);
            setCameraFor(null);
        } else if (isSelfieMode) {
            updateData({ selfieVerified: true });
            setIsSelfieMode(false);
        }
    };
    
    const handleSelfieComplete = () => {
        // This is now handled by the confirmation in CameraView
    };
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        updateData({ ssoEmail: email });
        if (email.trim() === '') {
            setIsEmailValid(null);
        } else {
            setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        }
    };

    const getEmailBorderColor = () => {
        if (isEmailValid === true) return 'border-green-500/50 focus:ring-green-500';
        if (isEmailValid === false) return 'border-red-500/50 focus:ring-red-500';
        return 'border-slate-700 focus:ring-cyan-500';
    };

    const PhotoCaptureBox: React.FC<{ label: string; photo: string | null; onCapture: () => void; }> = ({ label, photo, onCapture }) => (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="aspect-video bg-slate-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden">
                {photo ? (
                    <img src={photo} alt={label} className="w-full h-full object-contain" />
                ) : (
                    <button onClick={onCapture} className="flex flex-col items-center gap-2 text-slate-400 hover:text-cyan-400">
                        <Camera className="h-8 w-8" />
                        <span>Take Photo</span>
                    </button>
                )}
            </div>
            {photo && <button onClick={onCapture} className="text-sm text-cyan-500 hover:underline mt-2">{t('retake')} Photo</button>}
        </div>
    );
    
    return (
        <div className="max-w-3xl mx-auto">
            {(isCameraOpen || isSelfieMode) && (
                <CameraView 
                    mode={isSelfieMode ? 'selfie' : 'id'}
                    onClose={() => { setIsCameraOpen(false); setIsSelfieMode(false); setCameraFor(null); }}
                    onCapture={handleCapture}
                    onSelfieComplete={handleSelfieComplete}
                />
            )}
            <h2 className="text-2xl font-bold text-white mb-2">{t('verificationTitle')}</h2>
            <p className="text-slate-400 mb-8">{t('verificationSubtitle')}</p>
            
            <div className="space-y-6">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">{t('fullName')}</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="text" 
                            id="fullName" 
                            value={data.fullName}
                            onChange={(e) => updateData({ fullName: e.target.value })}
                            placeholder="e.g., Jane Doe"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('idType')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {idTypes.map(type => (
                            <button key={type.id} onClick={() => updateData({ idType: type.id as any })}
                                className={`p-3 text-sm font-semibold rounded-lg border-2 transition-colors ${data.idType === type.id ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white border-transparent' : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'}`}>
                                {type.name}
                            </button>
                        ))}
                    </div>
                </div>

                {data.idType && <div className="flex flex-col md:flex-row gap-4">
                    <PhotoCaptureBox label={t('idFront')} photo={data.idFrontPhoto} onCapture={() => { setCameraFor('idFrontPhoto'); setIsCameraOpen(true); }} />
                    {needsBackPhoto && <PhotoCaptureBox label={t('idBack')} photo={data.idBackPhoto} onCapture={() => { setCameraFor('idBackPhoto'); setIsCameraOpen(true); }} />}
                </div>}

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('livenessCheck')}</label>
                    {data.selfieVerified ? (
                         <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-400" />
                            <p className="font-semibold text-green-300">{t('selfieVerified')}</p>
                        </div>
                    ) : (
                        <button onClick={() => setIsSelfieMode(true)} className="w-full flex items-center justify-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                            <Video className="h-5 w-5 text-cyan-400" />
                            <span className="font-semibold text-white">{t('startLiveness')}</span>
                        </button>
                    )}
                </div>

                <div>
                    <label htmlFor="ssoEmail" className="block text-sm font-medium text-slate-300 mb-2">{t('ssoEmail')}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="email" 
                            id="ssoEmail" 
                            value={data.ssoEmail}
                            onChange={handleEmailChange}
                            placeholder="your.name@company.com"
                            className={`w-full bg-slate-800 border rounded-lg py-3 pl-10 pr-10 text-white focus:ring-2 focus:outline-none transition-colors ${getEmailBorderColor()}`}
                        />
                         {isEmailValid === true && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400" />}
                         {isEmailValid === false && <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />}
                    </div>
                     {isEmailValid === false && <p className="text-sm text-red-400 mt-1">Please enter a valid email address.</p>}
                </div>
            </div>
        </div>
    );
};