import { useState, useEffect } from 'react';
import { initSDK } from './runanywhere';
import { VisionTab } from './components/VisionTab';
import { VoiceTab } from './components/VoiceTab';

type Tab = 'vision' | 'voice';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('vision');

  useEffect(() => {
    // RunAnywhere SDK Initialization [cite: 25, 26]
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) => console.error("SDK Load Fail:", err));
  }, []);

  if (!sdkReady) {
    return <div className="loading">Blind-Partner AI is waking up...</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Blind-Partner <span style={{ color: '#ff5500' }}>OFFLINE</span></h1>
        </div>
        <nav className="tab-nav">
          <button 
            onClick={() => setActiveTab('vision')}
            className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
          >
            📷 Vision
          </button>
          <button 
            onClick={() => setActiveTab('voice')}
            className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
          >
            🎤 Voice
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'vision' && <VisionTab />}
        {activeTab === 'voice' && <VoiceTab />}
      </main>
    </div>
  );
}