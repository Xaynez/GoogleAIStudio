// Fix: Add `useRef` to the import from React.
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileText, Volume2, Languages, ChevronsUpDown, Loader, XCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { translateTextWithGemini, generateSpeechWithGemini } from '../../services/geminiService';
import { LANGUAGES } from '../../constants';

interface SummaryPanelProps {
  summary: string;
  voiceSummary: string;
}

// Helper to decode Base64 and raw PCM audio data for Web Audio API
const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};
async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}


export const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary, voiceSummary }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState(LANGUAGES[0].code);
  const [translationError, setTranslationError] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
      // Initialize AudioContext on user interaction (or component mount)
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return () => {
          // Cleanup audio source on unmount
          if (audioSourceRef.current) {
              audioSourceRef.current.stop();
          }
      }
  }, []);

  const handleSpeak = useCallback(async () => {
    if (isSpeaking) {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }
        setIsSpeaking(false);
        return;
    }

    setIsGeneratingSpeech(true);
    try {
        const base64Audio = await generateSpeechWithGemini(voiceSummary);
        const audioContext = audioContextRef.current;
        if (!audioContext) throw new Error("AudioContext not initialized");

        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, audioContext);

        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
            setIsSpeaking(false);
        };
        
        source.start(0);
        audioSourceRef.current = source;
        setIsSpeaking(true);

    } catch (error) {
        console.error("Error generating or playing speech:", error);
    } finally {
        setIsGeneratingSpeech(false);
    }
  }, [voiceSummary, isSpeaking]);

  const handleTranslate = async () => {
    if (!summary) return;
    setIsTranslating(true);
    setTranslationError('');
    setTranslatedText('');
    try {
      const translation = await translateTextWithGemini(summary, LANGUAGES.find(l=>l.code === targetLang)?.name || 'Spanish');
      setTranslatedText(translation);
    } catch (err) {
      setTranslationError('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const clearTranslation = () => {
    setTranslatedText('');
    setTranslationError('');
  };

  return (
    <Card title="Listing Summary" icon={<FileText className="h-6 w-6" />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-300">Voice Summary</h4>
          <button
            onClick={handleSpeak}
            className="flex items-center space-x-2 text-sm text-cyan-400 hover:underline disabled:opacity-50"
            disabled={isGeneratingSpeech}
            title={isSpeaking ? "Stop audio summary" : "Play audio summary"}
          >
            {isGeneratingSpeech ? <Loader className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
            <span>{isSpeaking ? 'Stop' : (isGeneratingSpeech ? 'Generating...' : 'Play Audio')}</span>
          </button>
        </div>
        <p className="text-slate-400 italic">"{voiceSummary}"</p>
        
        <hr className="border-slate-700" />
        
        <p className="text-slate-300 whitespace-pre-wrap">{summary}</p>

        <hr className="border-slate-700" />
        
        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Translate Summary</h4>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
               <select
                 value={targetLang}
                 onChange={(e) => setTargetLang(e.target.value)}
                 className="appearance-none w-full bg-slate-800 border border-slate-700 text-slate-200 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                 title="Select language to translate to"
               >
                 {LANGUAGES.map((lang) => (
                   <option key={lang.code} value={lang.code}>{lang.name}</option>
                 ))}
               </select>
               <ChevronsUpDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex items-center justify-center px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors w-36"
              title="Translate summary using AI"
            >
              {isTranslating ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Languages className="h-5 w-5 mr-2" />
                  <span>Translate</span>
                </>
              )}
            </button>
          </div>
          {translationError && <p className="text-red-400 text-sm mt-2">{translationError}</p>}
          {translatedText && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg relative">
              <p className="text-slate-300 pr-6">{translatedText}</p>
              <button onClick={clearTranslation} title="Clear translation" className="absolute top-3 right-3 text-slate-500 hover:text-slate-300">
                 <XCircle className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};