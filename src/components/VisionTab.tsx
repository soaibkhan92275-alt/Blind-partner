import { useState, useRef, useEffect } from 'react';
import { runVisionInference, speakText } from '../runanywhere';

export function VisionTab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resultText, setResultText] = useState("Taiyaar ho raha hai...");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    }
    startCamera();
  }, []);

  // Live Mode Loop [cite: 32, 73]
  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        handleInference("Aap ek blind assistant hain. Saamne ki rukawat ko ek chote Hindi vakya mein batayein.");
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  async function handleInference(prompt: string) {
    if (!videoRef.current || loading) return;
    setLoading(true);
    try {
      const response = await runVisionInference(videoRef.current, prompt);
      setResultText(response);
      // Hindi Voice Output [cite: 32, 67]
      await speakText(response, { lang: 'hi-IN' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vision-container">
      <video ref={videoRef} autoPlay playsInline className="vision-video" />

      <div className="result-box">
        <p className="result-text">{resultText}</p>
      </div>

      <div className="button-group">
        <button
          onClick={() => handleInference("Scan obstacles in Hindi.")}
          className="btn btn-primary"
        >
          📊 Describe
        </button>

        <button
          onClick={() => setIsLive(!isLive)}
          className={`btn ${isLive ? 'btn-danger' : 'btn-success'}`}
        >
          {isLive ? "⏹️ Stop" : "▶️ Live"}
        </button>
      </div>

      {loading && <p className="loading-text">📡 Processing...</p>}
    </div>
  );
}