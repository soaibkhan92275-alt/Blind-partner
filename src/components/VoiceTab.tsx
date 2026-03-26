import { useState, useRef, useEffect } from 'react';
import { ModelCategory } from '@runanywhere/web';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';

export function VoiceTab() {
  const loader = useModelLoader(ModelCategory.Audio);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('Tap to start listening');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Hindi

      recognitionRef.current.onstart = () => {
        setStatus('Listening...');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setStatus('Processing...');
        processVoiceCommand(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setStatus('Tap to start listening');
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus('Error occurred. Tap to try again.');
        setIsListening(false);
      };
    }
  }, []);

  const processVoiceCommand = async (command: string) => {
    try {
      // Simple voice commands for blind assistance
      const lowerCommand = command.toLowerCase();

      if (lowerCommand.includes('कहाँ') || lowerCommand.includes('where')) {
        setResponse('मैं आपकी मदद करने के लिए यहाँ हूँ। आप क्या जानना चाहते हैं?');
      } else if (lowerCommand.includes('समय') || lowerCommand.includes('time')) {
        const now = new Date();
        setResponse(`अभी समय है ${now.toLocaleTimeString('hi-IN')}`);
      } else if (lowerCommand.includes('तारीख') || lowerCommand.includes('date')) {
        const now = new Date();
        setResponse(`आज की तारीख है ${now.toLocaleDateString('hi-IN')}`);
      } else {
        setResponse(`आपने कहा: "${command}". मैं एक सरल आवाज सहायक हूँ।`);
      }

      setStatus('Response ready');
    } catch (error) {
      console.error('Voice processing error:', error);
      setResponse('क्षमा करें, कोई त्रुटि हुई।');
      setStatus('Error in processing');
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="voice-tab">
      {loader.state !== 'ready' && loader.state !== 'idle' && (
        <ModelBanner
          state={loader.state}
          progress={loader.progress}
          error={loader.error}
          onLoad={loader.ensure}
          label="Voice"
        />
      )}

      {/* Voice Orb */}
      <div
        className={`voice-orb ${isListening ? 'listening' : ''}`}
        onClick={recognitionRef.current ? (isListening ? stopListening : startListening) : undefined}
      >
        <span>
          {isListening ? '⏹️' : '🎤'}
        </span>
      </div>

      {/* Status Text */}
      <p className="voice-status">
        {status}
      </p>

      {/* Control Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={!recognitionRef.current}
        className={`btn btn-large ${isListening ? 'btn-danger' : 'btn-success'}`}
      >
        {isListening ? '🛑 Stop' : '🎤 Listen'}
      </button>

      {/* Transcript Section */}
      {transcript && (
        <div className="section-box">
          <h4>📝 You said:</h4>
          <p>{transcript}</p>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="section-box response-box">
          <h4>🤖 Response:</h4>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}