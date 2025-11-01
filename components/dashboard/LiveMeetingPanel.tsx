import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Radio, Calendar, History as HistoryIcon, Loader, AlertTriangle, Notebook, Copy, ScreenShare, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { UserProfile } from '../../types';
import { cleanupTranscriptionWithGemini } from '../../services/geminiService';
import { Tooltip } from '../common/Tooltip';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface LiveMeetingPanelProps {
    userProfile: UserProfile;
    onOpenScheduleMeeting: () => void;
    onOpenSyncEvents: () => void;
}

const BACKGROUND_EFFECTS = [
    { id: 'none', name: 'None', type: 'none' },
    { id: 'blur', name: 'Blur', type: 'blur' },
    { id: 'office', name: 'Office', type: 'image', url: 'https://picsum.photos/seed/office/1280/720' },
    { id: 'gradient', name: 'Gradient', type: 'image', url: 'https://picsum.photos/seed/gradient/1280/720' },
];

export const LiveMeetingPanel: React.FC<LiveMeetingPanelProps> = ({ userProfile, onOpenScheduleMeeting, onOpenSyncEvents }) => {
    const [isMeetingActive, setIsMeetingActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'denied'>('idle');
    const [transcriptCopied, setTranscriptCopied] = useState(false);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [showEffectsPicker, setShowEffectsPicker] = useState(false);
    const [activeEffect, setActiveEffect] = useState('none');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);
    const isScreenShareSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

    const cleanupStreams = useCallback(() => {
        [streamRef, screenStreamRef].forEach(ref => {
            if (ref.current) {
                ref.current.getTracks().forEach(track => track.stop());
                ref.current = null;
            }
        });
        if (videoRef.current) videoRef.current.srcObject = null;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }, []);

    useEffect(() => {
        if (activeEffect.startsWith('image:')) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = activeEffect.split(':')[1];
            img.onload = () => { backgroundImageRef.current = img; };
        } else {
            backgroundImageRef.current = null;
        }
    }, [activeEffect]);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        if (!isMeetingActive || !isCameraOn || !videoElement || !canvasElement) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;

        const drawFrame = () => {
            if (videoElement.readyState >= 2) {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                ctx.save();
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

                if (activeEffect === 'blur') {
                    ctx.filter = 'blur(8px)';
                    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                    ctx.filter = 'none';
                } else if (backgroundImageRef.current) {
                    ctx.drawImage(backgroundImageRef.current, 0, 0, canvasElement.width, canvasElement.height);
                    ctx.globalCompositeOperation = 'source-over'; // This is a simplified version. Real background removal is complex.
                    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                } else {
                    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                }
                ctx.restore();
            }
            animationFrameRef.current = requestAnimationFrame(drawFrame);
        };
        drawFrame();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isMeetingActive, isCameraOn, activeEffect]);
    
     const startMeeting = useCallback(async () => {
        setStatus('connecting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setIsMeetingActive(true);
            setIsCameraOn(true);
            setIsMicOn(true);
            setStatus('active');
            setTranscript('');
        } catch (err) {
            console.error(err);
            setStatus('denied');
        }
    }, []);

    const stopMeeting = useCallback(async () => {
        cleanupStreams();
        recognitionRef.current?.stop();
        setIsMeetingActive(false);
        setIsRecording(false);
        setIsSharingScreen(false);
        setStatus('idle');
         if (transcript.trim()) {
            const finalTranscript = await cleanupTranscriptionWithGemini(transcript);
            setTranscript(finalTranscript);
        }
    }, [cleanupStreams, transcript]);

     useEffect(() => {
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition not supported");
            return;
        }
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = userProfile.locale.code;
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript.trim() + '. ';
                }
            }
             if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
            }
        };
        recognition.onerror = (event: any) => console.error("Speech recognition error:", event.error);
        recognitionRef.current = recognition;
        return () => { recognition.stop(); };
    }, [userProfile.locale.code]);
    
     useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
    }, [transcript]);

     useEffect(() => {
        if (isRecording && isMeetingActive) {
            try {
                recognitionRef.current?.start();
            } catch(e) { console.error("Could not start recognition", e)}
        } else {
            recognitionRef.current?.stop();
        }
    }, [isRecording, isMeetingActive]);
    
    useEffect(() => {
        return () => {
            cleanupStreams();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [cleanupStreams]);
    
    const toggleMic = () => {
        if (!streamRef.current) return;
        const newState = !isMicOn;
        streamRef.current.getAudioTracks().forEach(track => track.enabled = newState);
        setIsMicOn(newState);
    };

    const toggleCamera = () => {
        if (!streamRef.current) return;
        const newState = !isCameraOn;
        streamRef.current.getVideoTracks().forEach(track => track.enabled = newState);
        setIsCameraOn(newState);
    };
    
    const toggleScreenShare = async () => {
        if (isSharingScreen) {
            screenStreamRef.current?.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            if (videoRef.current && streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
            }
            setIsSharingScreen(false);
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                screenStream.getVideoTracks()[0].onended = () => toggleScreenShare(); // Re-call to toggle state back
                screenStreamRef.current = screenStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = screenStream;
                }
                setIsSharingScreen(true);
            } catch (err) {
                console.error("Error sharing screen.", err);
            }
        }
    };

    const copyTranscript = () => {
        navigator.clipboard.writeText(transcript);
        setTranscriptCopied(true);
        setTimeout(() => setTranscriptCopied(false), 2000);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-grow bg-black rounded-lg aspect-video lg:aspect-auto lg:min-h-[60vh] relative flex items-center justify-center text-text-muted overflow-hidden border border-border-subtle">
                <video ref={videoRef} autoPlay muted playsInline className="hidden" />
                <canvas ref={canvasRef} className={`w-full h-full object-contain transition-opacity ${isMeetingActive ? 'opacity-100' : 'opacity-0'}`} />
                
                {!isMeetingActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 p-4">
                         {status === 'idle' && (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-2">Instant Meeting</h2>
                                <p className="mb-6 text-text-primary">Start a new video call with AI transcription.</p>
                                <button onClick={startMeeting} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all">Start Meeting</button>
                            </>
                        )}
                        {status === 'connecting' && <Loader className="animate-spin text-white h-10 w-10" />}
                        {status === 'denied' && (
                            <div className="text-center text-red-400 p-4">
                                <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                                <p>Camera/Mic access denied.</p>
                                <p className="text-sm text-text-secondary">Please enable permissions in your browser settings and try again.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {isMeetingActive && !isCameraOn && !isSharingScreen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
                        <VideoOff className="h-16 w-16 text-text-muted" />
                    </div>
                )}
            </div>
            
            <div className="lg:w-96 flex-shrink-0 flex flex-col gap-6">
                
                {isMeetingActive && (
                  <div className="bg-surface-card/50 p-4 rounded-lg border border-border-subtle relative">
                    <h3 className="font-bold text-text-primary mb-3">Meeting Controls</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
                       <ControlButton onClick={toggleMic} label="Mic" isToggled={isMicOn} icon={<Mic />} offIcon={<MicOff />} tooltip={isMicOn ? "Mute" : "Unmute"} />
                       <ControlButton onClick={toggleCamera} label="Camera" isToggled={isCameraOn} icon={<Video />} offIcon={<VideoOff />} tooltip={isCameraOn ? "Stop Camera" : "Start Camera"} disabled={isSharingScreen} />
                       <ControlButton onClick={toggleScreenShare} label="Share" isToggled={isSharingScreen} icon={<ScreenShare />} activeColor="bg-cyan-600" tooltip={isSharingScreen ? "Stop Sharing" : "Share Screen"} disabled={!isScreenShareSupported} />
                       <ControlButton onClick={() => setShowEffectsPicker(!showEffectsPicker)} label="Effects" isToggled={showEffectsPicker} icon={<Sparkles />} activeColor="bg-cyan-600" tooltip="Backgrounds & Effects"/>
                       <ControlButton onClick={() => setIsRecording(prev => !prev)} label="Record" isToggled={isRecording} icon={<Radio className={isRecording ? 'animate-pulse' : ''}/>} tooltip={isRecording ? "Stop Recording" : "Record & Transcribe"} />
                       <ControlButton onClick={stopMeeting} label="End Call" icon={<PhoneOff />} isEndCall />
                    </div>
                    {showEffectsPicker && <EffectsPicker activeEffect={activeEffect} onSelectEffect={setActiveEffect} />}
                  </div>
                )}

                <div className="bg-surface-card/50 rounded-lg flex flex-col border border-border-subtle flex-grow min-h-[250px]">
                     <div className="p-3 border-b border-border-subtle flex items-center justify-between">
                        <h3 className="text-md font-bold text-text-primary flex items-center gap-2">
                            <Notebook size={18} className="text-brand-cyan" /> AI Note Taker
                        </h3>
                        {isRecording && (
                             <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                TRANSCRIBING
                            </div>
                        )}
                    </div>
                    <div ref={transcriptContainerRef} className="flex-grow p-3 overflow-y-auto text-sm text-text-secondary whitespace-pre-wrap">
                        {transcript || <span className="text-text-muted">
                            {isMeetingActive ? (isRecording ? "Listening..." : "Press record to start transcription.") : "Start a meeting and press record to begin transcription."}
                        </span>}
                    </div>
                    {transcript && !isMeetingActive && (
                        <div className="p-2 border-t border-border-subtle">
                           <button onClick={copyTranscript} className="w-full text-center text-xs py-1.5 bg-surface-elevated hover:bg-surface-input text-brand-cyan rounded-md flex items-center justify-center gap-2">
                               <Copy size={14} /> {transcriptCopied ? 'Copied!' : 'Copy Transcript'}
                           </button>
                        </div>
                    )}
                </div>

                {!isMeetingActive && (
                    <div className="bg-surface-card/50 p-4 rounded-lg border border-border-subtle">
                        <h3 className="font-bold text-text-primary mb-3">Plan Ahead</h3>
                        <div className="grid grid-cols-1 gap-3">
                             <button onClick={onOpenScheduleMeeting} className="flex items-center gap-3 w-full p-3 bg-surface-elevated rounded-lg text-left hover:bg-surface-input transition-colors group">
                                <Calendar className="h-6 w-6 text-brand-cyan" />
                                <span className="font-semibold text-text-primary">Schedule Meeting</span>
                             </button>
                             <button onClick={onOpenSyncEvents} className="flex items-center gap-3 w-full p-3 bg-surface-elevated rounded-lg text-left hover:bg-surface-input transition-colors group">
                                <HistoryIcon className="h-6 w-6 text-brand-cyan" />
                                <span className="font-semibold text-text-primary">Sync Events</span>
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ControlButton: React.FC<{onClick: () => void, label: string, icon: React.ReactNode, offIcon?: React.ReactNode, isToggled?: boolean, activeColor?: string, isEndCall?: boolean, tooltip: string, disabled?: boolean}> = 
({ onClick, label, icon, offIcon, isToggled = true, activeColor, isEndCall = false, tooltip, disabled=false }) => (
    <Tooltip text={tooltip} position="top">
        <button onClick={onClick} disabled={disabled} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors w-full h-full text-xs
            ${isEndCall ? 'bg-red-600 hover:bg-red-700 text-white' : 
              isToggled ? (activeColor || 'bg-surface-input hover:bg-surface-elevated text-text-primary') : 
              'bg-red-600 hover:bg-red-700 text-white'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
            {isToggled ? icon : offIcon || icon}
            <span className="mt-1">{label}</span>
        </button>
    </Tooltip>
);

const EffectsPicker: React.FC<{ activeEffect: string, onSelectEffect: (effect: string) => void }> = ({ activeEffect, onSelectEffect }) => (
    <div className="absolute bottom-full left-0 mb-2 w-full bg-surface-modal p-2 rounded-lg border border-border-subtle shadow-lg animate-fade-in">
        <div className="grid grid-cols-4 gap-2">
            {BACKGROUND_EFFECTS.map(effect => (
                <Tooltip key={effect.id} text={effect.name} position="top">
                    <button onClick={() => onSelectEffect(effect.type === 'image' ? `image:${effect.url}` : effect.id)} className={`aspect-square rounded-md border-2 ${activeEffect === effect.id || activeEffect === `image:${effect.url}` ? 'border-brand-cyan' : 'border-transparent'}`}>
                        {effect.type === 'none' && <div className="w-full h-full bg-surface-elevated rounded-sm flex items-center justify-center text-text-muted">None</div>}
                        {effect.type === 'blur' && <div className="w-full h-full bg-surface-elevated rounded-sm flex items-center justify-center text-text-muted backdrop-blur-sm">Blur</div>}
                        {effect.type === 'image' && <img src={effect.url} alt={effect.name} className="w-full h-full object-cover rounded-sm" />}
                    </button>
                </Tooltip>
            ))}
        </div>
    </div>
);
