import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Video, AlertTriangle, Mic, MicOff, VideoOff, ScreenShare } from 'lucide-react';
import type { UserProfile, PostType } from '../../types';
import { useTranslation } from '../../i18n';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onAddPost: (postData: { contentText: string; type: PostType; isSponsored?: boolean; mediaFiles: File[] }) => void;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ isOpen, onClose, userProfile, onAddPost }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // New state for controls and status
    const [streamStatus, setStreamStatus] = useState<'connecting' | 'ready' | 'failed'>('connecting');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const cleanupStreams = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream, screenStream]);

    useEffect(() => {
        if (!isOpen) {
            cleanupStreams();
            return;
        }

        let isCancelled = false;
        
        setIsClosing(false);
        setError(null);
        setStreamStatus('connecting');
        setIsScreenSharing(false);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(mediaStream => {
                if (isCancelled) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    return;
                }
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setStreamStatus('ready');
                setIsMicOn(true);
                setIsCameraOn(true);
            })
            .catch(err => {
                if (!isCancelled) {
                    console.error("Camera/Mic error:", err);
                    setError(t('cameraErrorText'));
                    setStreamStatus('failed');
                }
            });

        return () => {
            isCancelled = true;
            cleanupStreams();
        };
    }, [isOpen, t, cleanupStreams]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setDescription('');
        }, 300);
    };

    const handleStartStream = () => {
        onAddPost({
            contentText: description || `${userProfile.fullName.split(' ')[0]} is now live!`,
            type: 'live',
            mediaFiles: [],
        });
        triggerClose();
    };
    
    const handleToggleMic = () => {
        if (!stream) return;
        stream.getAudioTracks().forEach(track => {
            track.enabled = !isMicOn;
        });
        setIsMicOn(!isMicOn);
    };

    const handleToggleCamera = () => {
        if (!stream) return;
        if (isScreenSharing) return; // Camera is irrelevant when screen sharing
        const newCameraState = !isCameraOn;
        stream.getVideoTracks().forEach(track => {
            track.enabled = newCameraState;
        });
        setIsCameraOn(newCameraState);
    };

    const handleToggleScreenShare = async () => {
        if (isScreenSharing) {
            // Stop screen sharing
            screenStream?.getTracks().forEach(track => track.stop());
            setScreenStream(null);
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
            }
            setIsScreenSharing(false);
        } else {
            // Start screen sharing
            try {
                const newScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                newScreenStream.getVideoTracks()[0].addEventListener('ended', () => {
                    // This handles the user clicking the native "Stop sharing" button
                    setIsScreenSharing(false);
                    if (videoRef.current && stream) {
                        videoRef.current.srcObject = stream;
                    }
                });
                setScreenStream(newScreenStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newScreenStream;
                }
                setIsScreenSharing(true);
            } catch (err) {
                console.error("Error sharing screen", err);
            }
        }
    };

    const StatusBadge: React.FC<{ status: typeof streamStatus }> = ({ status }) => {
        const config = {
            connecting: { text: 'Connecting...', color: 'bg-yellow-500' },
            ready: { text: 'Preview', color: 'bg-green-500' },
            failed: { text: 'Failed', color: 'bg-red-500' },
        };
        const { text, color } = config[status];
        return (
            <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5 ${color}`}>
                <div className={`w-2 h-2 rounded-full bg-white ${status === 'connecting' ? 'animate-pulse' : ''}`}></div>
                {text}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Video className="text-red-400"/> {t('liveStreamTitle')}</h2>
                    <button onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-slate-700 flex items-center justify-center">
                        <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-contain transition-opacity ${streamStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`} />
                        <StatusBadge status={streamStatus} />
                        
                        {streamStatus === 'failed' && (
                             <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white p-4 text-center">
                                <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                                <h3 className="text-xl font-bold">{t('cameraErrorTitle')}</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        {streamStatus === 'connecting' && (
                            <p className="text-slate-400">Requesting camera access...</p>
                        )}
                        {!isCameraOn && !isScreenSharing && (
                             <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
                                <VideoOff className="h-16 w-16 text-slate-400" />
                             </div>
                        )}
                    </div>

                     <div className="flex justify-center items-center p-2 bg-slate-800/50 rounded-full gap-2">
                           <button onClick={handleToggleMic} className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                           </button>
                           <button onClick={handleToggleCamera} disabled={isScreenSharing} className={`p-3 rounded-full transition-colors ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed`}>
                              {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                           </button>
                           <button onClick={handleToggleScreenShare} className={`p-3 rounded-full transition-colors ${isScreenSharing ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}>
                              <ScreenShare className="h-5 w-5" />
                           </button>
                    </div>

                     <div>
                        <label htmlFor="live-description" className="block text-sm font-medium text-slate-300 mb-1">{t('liveStreamDescription')}</label>
                        <textarea
                            id="live-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is your live stream about?"
                            rows={2}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={handleStartStream}
                        disabled={streamStatus !== 'ready'}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {t('goLive')}
                    </button>
                </div>
            </div>
        </div>
    );
};
