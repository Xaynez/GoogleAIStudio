import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Radio, Calendar, History as HistoryIcon, Loader, AlertTriangle, Notebook, Copy } from 'lucide-react';
import type { UserProfile } from '../../types';
import { cleanupTranscriptionWithGemini } from '../../services/geminiService';

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

export const LiveMeetingPanel: React.FC<LiveMeetingPanelProps> = ({ userProfile, onOpenScheduleMeeting, onOpenSyncEvents }) => {
    const [isMeetingActive, setIsMeetingActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'denied'>('idle');
    const [transcriptCopied, setTranscriptCopied] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);

    const cleanupStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

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

        return () => {
            recognition.stop();
        };
    }, [userProfile.locale.code]);
    
     useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
    }, [transcript]);

    const startMeeting = useCallback(async () => {
        setStatus('connecting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
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
        cleanupStream();
        recognitionRef.current?.stop();
        setIsMeetingActive(false);
        setIsRecording(false);
        setStatus('idle');
         if (transcript.trim()) {
            const finalTranscript = await cleanupTranscriptionWithGemini(transcript);
            setTranscript(finalTranscript);
        }
    }, [cleanupStream, transcript]);
    
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
            cleanupStream();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [cleanupStream]);
    
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

    const copyTranscript = () => {
        navigator.clipboard.writeText(transcript);
        setTranscriptCopied(true);
        setTimeout(() => setTranscriptCopied(false), 2000);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Video Panel (Main content) */}
            <div className="flex-grow bg-black rounded-lg aspect-video lg:aspect-auto lg:min-h-[60vh] relative flex items-center justify-center text-slate-500 overflow-hidden border border-slate-700">
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transition-opacity ${isCameraOn && isMeetingActive ? 'opacity-100' : 'opacity-0'}`} />
                
                {!isMeetingActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 p-4">
                        {status === 'idle' && (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-2">Instant Meeting</h2>
                                <p className="mb-6 text-slate-300">Start a new video call with AI transcription.</p>
                                <button onClick={startMeeting} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all">Start Meeting</button>
                            </>
                        )}
                        {status === 'connecting' && <Loader className="animate-spin text-white h-10 w-10" />}
                        {status === 'denied' && (
                            <div className="text-center text-red-400 p-4">
                                <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                                <p>Camera/Mic access denied.</p>
                                <p className="text-sm text-slate-400">Please enable permissions in your browser settings and try again.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {isMeetingActive && !isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        <VideoOff className="h-16 w-16 text-slate-600" />
                    </div>
                )}
            </div>
            
            {/* Right Sidebar */}
            <div className="lg:w-96 flex-shrink-0 flex flex-col gap-6">
                
                {/* Controls Panel (visible when meeting is active) */}
                {isMeetingActive && (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="font-bold text-white mb-3">Meeting Controls</h3>
                    <div className="grid grid-cols-4 gap-2">
                       <button onClick={toggleMic} title={isMicOn ? "Mute" : "Unmute"} className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                          {isMicOn ? <Mic /> : <MicOff />} <span className="text-xs mt-1">Mic</span>
                       </button>
                       <button onClick={toggleCamera} title={isCameraOn ? "Stop Camera" : "Start Camera"} className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                          {isCameraOn ? <Video /> : <VideoOff />} <span className="text-xs mt-1">Camera</span>
                       </button>
                       <button onClick={() => setIsRecording(prev => !prev)} title={isRecording ? "Stop Recording & Transcription" : "Record & Transcribe"} className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${isRecording ? 'bg-red-600/80' : 'bg-slate-700 hover:bg-slate-600'} text-white`}>
                          <Radio className={`${isRecording ? 'animate-pulse' : ''}`} /> <span className="text-xs mt-1">Record</span>
                       </button>
                       <button onClick={stopMeeting} title="End Call" className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                           <PhoneOff /> <span className="text-xs mt-1">End Call</span>
                       </button>
                    </div>
                  </div>
                )}

                {/* AI Note Taker Panel */}
                <div className="bg-slate-800/50 rounded-lg flex flex-col border border-slate-700 flex-grow min-h-[250px]">
                    <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                            <Notebook size={18} className="text-cyan-400" /> AI Note Taker
                        </h3>
                        {isRecording && (
                             <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                TRANSCRIBING
                            </div>
                        )}
                    </div>
                    <div ref={transcriptContainerRef} className="flex-grow p-3 overflow-y-auto text-sm text-slate-300 whitespace-pre-wrap">
                        {transcript || <span className="text-slate-500">
                            {isMeetingActive ? (isRecording ? "Listening..." : "Press record to start transcription.") : "Start a meeting and press record to begin transcription."}
                        </span>}
                    </div>
                    {transcript && !isMeetingActive && (
                        <div className="p-2 border-t border-slate-700">
                           <button onClick={copyTranscript} className="w-full text-center text-xs py-1.5 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded-md flex items-center justify-center gap-2">
                               <Copy size={14} /> {transcriptCopied ? 'Copied!' : 'Copy Transcript'}
                           </button>
                        </div>
                    )}
                </div>

                {/* Scheduling Actions Panel */}
                {!isMeetingActive && (
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <h3 className="font-bold text-white mb-3">Plan Ahead</h3>
                        <div className="grid grid-cols-1 gap-3">
                             <button onClick={onOpenScheduleMeeting} className="flex items-center gap-3 w-full p-3 bg-slate-800 rounded-lg text-left hover:bg-slate-700/80 transition-colors group">
                                <Calendar className="h-6 w-6 text-cyan-400" />
                                <span className="font-semibold text-slate-200">Schedule Meeting</span>
                             </button>
                             <button onClick={onOpenSyncEvents} className="flex items-center gap-3 w-full p-3 bg-slate-800 rounded-lg text-left hover:bg-slate-700/80 transition-colors group">
                                <HistoryIcon className="h-6 w-6 text-cyan-400" />
                                <span className="font-semibold text-slate-200">Sync Events</span>
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
