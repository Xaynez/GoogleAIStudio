import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, ScreenShare, X, Bot, CheckCircle, Notebook, ChevronsUpDown, AlertTriangle, Loader } from 'lucide-react';
import { summarizeMeetingNotesWithGemini } from '../services/geminiService';
import { SUPPORTED_LOCALES } from '../constants';

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


interface MeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingContext: string;
  openNoteTakerByDefault?: boolean;
}

export const MeetModal: React.FC<MeetModalProps> = ({ isOpen, onClose, listingContext, openNoteTakerByDefault = false }) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isNoteTakerActive, setIsNoteTakerActive] = useState(openNoteTakerByDefault);
  const [callEnded, setCallEnded] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [transcribedNotes, setTranscribedNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [permissionState, setPermissionState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [summaryLanguage, setSummaryLanguage] = useState(SUPPORTED_LOCALES[0].name);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'failed'>('disconnected');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pc1Ref = useRef<RTCPeerConnection | null>(null); // Caller
  const pc2Ref = useRef<RTCPeerConnection | null>(null); // Callee

  const cleanupStreams = useCallback(() => {
    [streamRef, screenStreamRef].forEach(ref => {
      if (ref.current) {
        ref.current.getTracks().forEach(track => track.stop());
        ref.current = null;
      }
    });
    if (pc1Ref.current) {
        pc1Ref.current.close();
        pc1Ref.current = null;
    }
    if (pc2Ref.current) {
        pc2Ref.current.close();
        pc2Ref.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    setConnectionState('disconnected');
  }, []);

  const startCall = useCallback(async () => {
    setConnectionState('connecting');
    cleanupStreams();
    try {
      // 1. Get local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setIsMicOn(true);
      setPermissionState('granted');

      // 2. Setup Peer Connections (Simulated)
      const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      
      const pc1 = new RTCPeerConnection(servers);
      const pc2 = new RTCPeerConnection(servers);
      pc1Ref.current = pc1;
      pc2Ref.current = pc2;

      pc1.onicecandidate = e => e.candidate && pc2.addIceCandidate(e.candidate);
      pc2.onicecandidate = e => e.candidate && pc1.addIceCandidate(e.candidate);

      pc1.oniceconnectionstatechange = () => {
          if (pc1.iceConnectionState === 'connected' || pc1.iceConnectionState === 'completed') {
              setConnectionState('connected');
          } else if (pc1.iceConnectionState === 'failed') {
              setConnectionState('failed');
          }
      };
      
      pc2.ontrack = e => {
          if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = e.streams[0];
          }
      };

      // 3. Add local tracks to caller
      stream.getTracks().forEach(track => pc1.addTrack(track, stream));

      // 4. Signaling
      const offer = await pc1.createOffer();
      await pc1.setLocalDescription(offer);
      
      await pc2.setRemoteDescription(offer);
      const answer = await pc2.createAnswer();
      await pc2.setLocalDescription(answer);

      await pc1.setRemoteDescription(answer);

    } catch (err) {
      console.error("Error starting call.", err);
      setIsCameraOn(false);
      setIsMicOn(false);
      setPermissionState('denied');
      setConnectionState('failed');
    }
  }, [cleanupStreams]);

  useEffect(() => {
    if (isOpen) {
        setIsClosing(false);
        setIsNoteTakerActive(openNoteTakerByDefault); // Reset on open
    } else {
      cleanupStreams();
    }
    return cleanupStreams;
  }, [isOpen, cleanupStreams, openNoteTakerByDefault]);

  // Speech Recognition Setup
  useEffect(() => {
    if (!isOpen || !SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = SUPPORTED_LOCALES.find(l => l.name === summaryLanguage)?.code || 'en-US';
    
    recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            }
        }
        if (transcript) {
            setTranscribedNotes(prev => prev + transcript.trim() + '.\n\n');
        }
    };
    recognition.onerror = (event: any) => console.error("Speech recognition error:", event.error);
    
    recognitionRef.current = recognition;

    return () => {
        recognition.stop();
    };
  }, [isOpen, summaryLanguage]);
  
  // Start/Stop recognition based on state
  useEffect(() => {
      const recognition = recognitionRef.current;
      if (connectionState === 'connected' && recognition) {
          if (isNoteTakerActive) {
              try {
                  recognition.start();
              } catch (e) {
                  // May throw if already started
                  console.warn("Speech recognition already started.");
              }
          } else {
              recognition.stop();
          }
      }
  }, [isNoteTakerActive, connectionState]);


  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      setIsSharingScreen(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            setIsSharingScreen(false);
            if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
        });
        screenStreamRef.current = screenStream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }
        setIsSharingScreen(true);
      } catch (err) {
        console.error("Error sharing screen.", err);
      }
    }
  };

  const handleEndCall = async () => {
    cleanupStreams();
    recognitionRef.current?.stop();
    setPermissionState('idle'); // Reset permission state
    if (isNoteTakerActive && transcribedNotes.trim()) {
      setIsGeneratingSummary(true);
      try {
        const summary = await summarizeMeetingNotesWithGemini(transcribedNotes, listingContext, summaryLanguage);
        setMeetingSummary(summary);
      } catch (error) {
        console.error("Failed to generate meeting summary", error);
        setMeetingSummary("Sorry, we couldn't generate the meeting summary at this time.");
      } finally {
        setIsGeneratingSummary(false);
      }
    }
    setCallEnded(true);
  };
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        cleanupStreams();
        setCallEnded(false);
        setMeetingSummary(null);
        setIsNoteTakerActive(false);
        setTranscribedNotes('');
        setPermissionState('idle');
        onClose();
    }, 300); // Match animation duration
  };

  if (!isOpen) return null;
  
  const renderContent = () => {
    if (callEnded) {
        return (
            <div className="w-full flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">Call Ended</h3>
                { (isNoteTakerActive && transcribedNotes.trim()) ? (
                     isGeneratingSummary ? (
                        <div className="mt-4 text-slate-300">
                            <p>Generating AI summary in {summaryLanguage}...</p>
                        </div>
                    ) : meetingSummary ? (
                       <div className="mt-6 w-full max-w-3xl text-left bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-lg text-cyan-400 mb-2">Meeting Summary ({summaryLanguage})</h4>
                            <p className="text-slate-300 whitespace-pre-wrap">{meetingSummary}</p>
                        </div>
                    ) : null
                ) : (
                    <p className="text-slate-400 mt-2">You have left the meeting.</p>
                )}
                <button onClick={handleClose} className="mt-8 px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                    Close
                </button>
            </div>
        );
    }
    
    switch (permissionState) {
        case 'idle':
            return (
                 <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg">
                    <Video className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white">Ready to join?</h3>
                    <p className="text-slate-400 mt-2 max-w-sm">To start the meeting, we'll need access to your camera and microphone. Your browser will ask you for permission.</p>
                    <button onClick={startCall} className="mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        Join Now
                    </button>
                </div>
            );
        case 'denied':
             return (
                 <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg">
                    <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white">Permissions Required</h3>
                    <p className="text-slate-400 mt-2 max-w-sm">
                        EVOLVE needs access to your camera and microphone. Please allow access in your browser's settings, then click Retry.
                    </p>
                    <button onClick={startCall} className="mt-8 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                        Retry
                    </button>
                </div>
            );
        case 'granted':
             return (
                 <>
                    <div className="flex-grow flex flex-col gap-4">
                        <div className="flex-grow bg-black rounded-lg overflow-hidden relative">
                            {/* Main video: Screen share > Remote Peer > Connection Status */}
                            <video ref={screenVideoRef} autoPlay className={`w-full h-full object-contain transition-opacity duration-300 ${isSharingScreen ? 'opacity-100' : 'opacity-0 hidden'}`} />
                            <video ref={remoteVideoRef} autoPlay className={`w-full h-full object-contain transition-opacity duration-300 ${!isSharingScreen ? 'opacity-100' : 'opacity-0 hidden'}`} />

                            {/* Status Overlay */}
                            {connectionState !== 'connected' && !isSharingScreen && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
                                    <div className="text-center">
                                        <Loader className="h-12 w-12 text-slate-400 mx-auto mb-2 animate-spin" />
                                        <p className="text-white">{connectionState === 'connecting' ? 'Connecting to peer...' : 'Connection Failed'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Local video (PiP) */}
                            <div className="absolute bottom-4 right-4 w-1/4 max-w-[240px] aspect-video rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg z-10">
                                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
                                {!isCameraOn && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                        <VideoOff className="h-8 w-8 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex justify-center items-center p-4 bg-slate-900/50 rounded-b-lg gap-4 relative">
                           <button onClick={toggleMic} className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                              {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                           </button>
                           <button onClick={toggleCamera} className={`p-3 rounded-full transition-colors ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                              {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                           </button>
                           <button onClick={toggleScreenShare} className={`p-3 rounded-full transition-colors ${isSharingScreen ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}>
                              <ScreenShare className="h-6 w-6" />
                           </button>
                           <button onClick={() => setIsNoteTakerActive(!isNoteTakerActive)} className={`p-3 rounded-full transition-colors ${isNoteTakerActive ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}>
                               <Bot className="h-6 w-6" />
                           </button>
                            <button onClick={handleEndCall} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors absolute right-8 bottom-1/2 translate-y-1/2">
                                <PhoneOff className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    {isNoteTakerActive && (
                        <div className="w-1/3 flex flex-col bg-slate-800/50 rounded-lg border border-slate-700 transition-all duration-300">
                            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Notebook className="h-5 w-5 text-cyan-400" />
                                    AI Note Taker
                                </h3>
                                <div className="relative">
                                     <select
                                        value={summaryLanguage}
                                        onChange={(e) => setSummaryLanguage(e.target.value)}
                                        className="appearance-none text-xs bg-slate-700 border border-slate-600 text-slate-200 py-1 pl-2 pr-7 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                     >
                                         {SUPPORTED_LOCALES.map((lang) => (
                                            <option key={lang.code} value={lang.name}>{lang.name.split(' ')[0]}</option>
                                         ))}
                                     </select>
                                     <ChevronsUpDown className="h-3 w-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto">
                                <div className="w-full h-full p-2 bg-transparent text-slate-300 text-sm whitespace-pre-wrap">
                                    {transcribedNotes || "AI Note Taker is listening..."}
                                </div>
                            </div>
                             <div className="p-2 text-xs text-center text-slate-500 border-t border-slate-700">
                                Click "End Call" to generate an AI summary of these notes in your chosen language.
                            </div>
                        </div>
                    )}
                 </>
             );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">EVOLVE Meet</h2>
          </div>
           <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
              <X className="h-6 w-6" />
           </button>
        </div>

        <div className="flex-grow flex p-4 gap-4 overflow-hidden">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};