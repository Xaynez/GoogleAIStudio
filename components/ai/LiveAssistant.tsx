import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, X, Bot, Power } from 'lucide-react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAiBlob } from '@google/genai';

// --- Helper Functions for Audio Encoding/Decoding ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


type TranscriptItem = {
    id: number;
    source: 'user' | 'model';
    text: string;
};

export const LiveAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');
    
    const handleToggleOpen = () => {
        if (isOpen) {
            stopSession();
            setIsClosing(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsClosing(false);
            }, 300);
        } else {
            setIsOpen(true);
            setTranscripts([]);
        }
    };

    const startSession = useCallback(async () => {
        if (sessionPromiseRef.current) return;
        setStatus('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Init input audio context
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            }
            // Init output audio context
            if (!outputAudioContextRef.current) {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: GenAiBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                        } else if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                        }

                        if(message.serverContent?.turnComplete) {
                            setTranscripts(prev => [
                                ...prev,
                                { id: Date.now(), source: 'user', text: currentInputTranscription.current },
                                { id: Date.now()+1, source: 'model', text: currentOutputTranscription.current }
                            ]);
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                        }

                        // Handle audio playback
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData) {
                            setStatus('speaking');
                            const outputContext = outputAudioContextRef.current!;
                            const base64Decoded = decode(audioData);
                            const audioBuffer = await decodeAudioData(base64Decoded, outputContext, 24000, 1);
                            
                            const source = outputContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputContext.destination);

                            const nextStartTime = Math.max(nextStartTimeRef.current, outputContext.currentTime);
                            source.start(nextStartTime);
                            nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                            audioQueueRef.current.add(source);
                            source.onended = () => {
                                audioQueueRef.current.delete(source);
                                if(audioQueueRef.current.size === 0) {
                                    setStatus('listening');
                                }
                            };
                        }

                        if (message.serverContent?.interrupted) {
                            audioQueueRef.current.forEach(source => source.stop());
                            audioQueueRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus('error');
                    },
                    onclose: (e: CloseEvent) => {
                        stopSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}},
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                }
            });

        } catch (error) {
            console.error('Failed to start session', error);
            setStatus('error');
        }
    }, []);

    const stopSession = useCallback(() => {
        if(sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current?.mediaStream.getTracks().forEach(track => track.stop());
        
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        
        audioQueueRef.current.forEach(source => source.stop());
        audioQueueRef.current.clear();
        nextStartTimeRef.current = 0;
        
        setStatus('idle');
    }, []);
    
    useEffect(() => {
        return () => stopSession();
    }, [stopSession]);


    const StatusIndicator = () => {
        switch (status) {
            case 'listening': return <div className="text-sm text-green-400">Listening...</div>;
            case 'speaking': return <div className="text-sm text-cyan-400">Speaking...</div>;
            case 'connecting': return <div className="text-sm text-yellow-400">Connecting...</div>;
            case 'error': return <div className="text-sm text-red-400">Error</div>;
            default: return <div className="text-sm text-slate-400">Idle</div>;
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={handleToggleOpen}
                className="fixed bottom-24 right-6 bg-slate-800 text-white rounded-full p-4 shadow-lg hover:bg-slate-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Open Live AI Assistant"
                title="Open Live AI Assistant"
            >
                <Mic className="h-7 w-7" />
            </button>
        );
    }
    
    return (
        <div className={`fixed bottom-6 right-6 w-96 h-[60vh] bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Live Assistant</h3>
                </div>
                <button onClick={handleToggleOpen} title="Close Live Assistant" aria-label="Close Live Assistant" className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </header>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {transcripts.map((item) => (
                    <div key={item.id} className={`flex gap-2 ${item.source === 'user' ? 'justify-end' : ''}`}>
                        <div className={`p-3 rounded-lg max-w-[80%] ${item.source === 'user' ? 'bg-cyan-600 rounded-br-none text-white' : 'bg-slate-800 rounded-tl-none text-slate-300'}`}>
                            <p className="text-sm">{item.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <footer className="p-4 border-t border-slate-800 flex-shrink-0 flex flex-col items-center gap-2">
                <button 
                    onClick={status === 'idle' || status === 'error' ? startSession : stopSession} 
                    title={status === 'idle' || status === 'error' ? 'Start session' : 'Stop session'}
                    aria-label={status === 'idle' || status === 'error' ? 'Start voice session' : 'Stop voice session'}
                    className={`p-5 rounded-full transition-colors text-white ${status === 'listening' || status === 'speaking' ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                >
                    {status === 'idle' || status === 'error' ? <Mic className="h-8 w-8" /> : <Power className="h-8 w-8" />}
                </button>
                <StatusIndicator />
            </footer>
        </div>
    );
};