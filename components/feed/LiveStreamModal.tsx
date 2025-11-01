import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Video, AlertTriangle, Mic, MicOff, VideoOff, ScreenShare, Radio } from 'lucide-react';
import type { UserProfile, PostType } from '../../types';
import { useTranslation } from '../../i18n';
import { Tooltip } from '../common/Tooltip';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onAddPost: (postData: { id: string; contentText: string; type: PostType; mediaFiles: File[]; tags: string[] }) => void;
  onEndLiveStream: (postId: string) => void;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ isOpen, onClose, userProfile, onAddPost, onEndLiveStream }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [description, setDescription] = useState('');
    
    // State for controls and status
    const [liveState, setLiveState] = useState<'connecting' | 'setup' | 'live' | 'failed'>('connecting');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [livePostId, setLivePostId] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const isScreenShareSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

    const cleanupStreams = useCallback(() => {
        [streamRef, screenStreamRef].forEach(ref => {
            if (ref.current) {
                ref.current.getTracks().forEach(track => track.stop());
                ref.current = null;
            }
        });
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            let isCancelled = false;
            setLiveState('connecting');
            setIsClosing(false);
            setError(null);
            setIsScreenSharing(false);

            const startCamera = async () => {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    if (isCancelled) {
                        mediaStream.getTracks().forEach(track => track.stop());
                        return;
                    }
                    streamRef.current = mediaStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                    setLiveState('setup');
                    setIsMicOn(true);
                    setIsCameraOn(true);
                } catch (err) {
                    if (!isCancelled) {
                        console.error("Camera/Mic error:", err);
                        setError('Could not access camera and microphone. Please check permissions.');
                        setLiveState('failed');
                    }
                }
            };
            startCamera();

            return () => {
                isCancelled = true;
                cleanupStreams();
            };
        }
    }, [isOpen, cleanupStreams]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            // Reset state for next open
            setLiveState('connecting');
            setDescription('');
            setLivePostId(null);
        }, 300);
    };

    const handleGoLive = () => {
        const postId = `live-${Date.now()}`;
        setLivePostId(postId);
        onAddPost({
            id: postId,
            contentText: description || `${userProfile.fullName.split(' ')[0]} is now live!`,
            type: 'live',
            mediaFiles: [],
            tags: (description.match(/#\w+/g) || []).map(tag => tag.substring(1)),
        });
        setLiveState('live');
    };
    
    const handleEndStream = () => {
        if (livePostId) {
            onEndLiveStream(livePostId);
        }
        cleanupStreams();
        triggerClose();
    };

    const handleToggleMic = () => {
        if (!streamRef.current) return;
        streamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !isMicOn;
        });
        setIsMicOn(!isMicOn);
    };

    const handleToggleCamera = () => {
        if (!streamRef.current || isScreenSharing) return;
        const newCameraState = !isCameraOn;
        streamRef.current.getVideoTracks().forEach(track => {
            track.enabled = newCameraState;
        });
        setIsCameraOn(newCameraState);
    };

    const handleToggleScreenShare = async () => {
        if (!isScreenShareSupported) return;

        if (isScreenSharing) {
            screenStreamRef.current?.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            if (videoRef.current && streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
            }
            setIsScreenSharing(false);
            streamRef.current?.getVideoTracks().forEach(track => track.enabled = isCameraOn);
        } else {
            try {
                const newScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                newScreenStream.getVideoTracks()[0].addEventListener('ended', () => {
                    if (videoRef.current && streamRef.current) {
                        videoRef.current.srcObject = streamRef.current;
                    }
                    setIsScreenSharing(false);
                    streamRef.current?.getVideoTracks().forEach(track => track.enabled = isCameraOn);
                });
                screenStreamRef.current = newScreenStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = newScreenStream;
                }
                streamRef.current?.getVideoTracks().forEach(track => track.enabled = false);
                setIsScreenSharing(true);
            } catch (err) {
                console.error("Error sharing screen", err);
            }
        }
    };

    const renderSetupContent = () => (
        <>
            <div className="p-6 space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-slate-700 flex items-center justify-center">
                    <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-contain transition-opacity ${liveState === 'setup' ? 'opacity-100' : 'opacity-0'}`} />
                    {liveState === 'failed' && (
                        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white p-4 text-center">
                            <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                            <h3 className="text-xl font-bold">Device Error</h3><p>{error}</p>
                        </div>
                    )}
                    {liveState === 'connecting' && <p className="text-slate-400">Requesting camera access...</p>}
                    {!isCameraOn && !isScreenSharing && <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80"><VideoOff className="h-16 w-16 text-slate-400" /></div>}
                </div>
                <div className="flex justify-center items-center p-2 bg-slate-800/50 rounded-full gap-2">
                    <Tooltip text={isMicOn ? 'Mute' : 'Unmute'} position="top">
                        <button onClick={handleToggleMic} disabled={liveState !== 'setup'} className="p-3 rounded-full text-white disabled:opacity-50 transition-colors bg-slate-700 hover:bg-slate-600"><Mic className="h-5 w-5" /></button>
                    </Tooltip>
                    <Tooltip text={isCameraOn ? 'Stop camera' : 'Start camera'} position="top">
                        <button onClick={handleToggleCamera} disabled={liveState !== 'setup' || isScreenSharing} className="p-3 rounded-full text-white disabled:opacity-50 transition-colors bg-slate-700 hover:bg-slate-600"><Video className="h-5 w-5" /></button>
                    </Tooltip>
                    <Tooltip text={!isScreenShareSupported ? 'Not supported' : isScreenSharing ? 'Stop sharing' : 'Share screen'} position="top">
                        <button onClick={handleToggleScreenShare} disabled={liveState !== 'setup' || !isScreenShareSupported} className={`p-3 rounded-full text-white disabled:opacity-50 transition-colors ${isScreenSharing ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}><ScreenShare className="h-5 w-5" /></button>
                    </Tooltip>
                </div>
                <div>
                    <label htmlFor="live-description" className="block text-sm font-medium text-slate-300 mb-1">Description (optional)</label>
                    <textarea id="live-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is your live stream about? You can add #tags." rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"/>
                </div>
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                <button onClick={handleGoLive} disabled={liveState !== 'setup'} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed">Go Live</button>
            </div>
        </>
    );

    const renderLiveContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 flex-grow flex flex-col items-center justify-center text-center">
                 <div className="relative mb-4">
                    <Radio className="h-20 w-20 text-red-500 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-xs">LIVE</div>
                 </div>
                 <h3 className="text-2xl font-bold text-white">You are Live!</h3>
                 <p className="text-slate-400 mt-1">Your stream is now visible in the feed.</p>
            </div>
             <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-center">
                <button onClick={handleEndStream} className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">End Stream</button>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out flex flex-col ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Video className="text-red-400"/> {liveState === 'live' ? 'Live Stream Controls' : 'Live Stream Setup'}</h2>
                    <button onClick={liveState === 'live' ? handleEndStream : triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                {liveState === 'live' ? renderLiveContent() : renderSetupContent()}
            </div>
        </div>
    );
};
