import { RunAnywhere, SDKEnvironment } from '@runanywhere/web'; 
import { VLMWorkerBridge } from '@runanywhere/web-llamacpp';

export async function initSDK() {
  // Initialize RunAnywhere SDK for offline processing
  await RunAnywhere.initialize({
    environment: SDKEnvironment.Development
  });
}

export async function runVisionInference(videoElement: HTMLVideoElement, prompt: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  ctx.drawImage(videoElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rgbPixels = new Uint8Array((imageData.data.length / 4) * 3);

  for (let i = 0, j = 0; i < imageData.data.length; i += 4, j += 3) {
    rgbPixels[j] = imageData.data[i];     
    rgbPixels[j + 1] = imageData.data[i + 1]; 
    rgbPixels[j + 2] = imageData.data[i + 2]; 
  }

  // Local vision processing using WebGPU/WASM [cite: 43, 64]
  const result = await VLMWorkerBridge.shared.process(rgbPixels, canvas.width, canvas.height, prompt);
  return typeof result === 'string' ? result : result.text || String(result);
}

export async function speakText(text: string, options: { lang: string }) {
  // On-device Hindi voice synthesis [cite: 30, 73]
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang; // 'hi-IN' use karein
    utterance.rate = 0.9; // Thoda slow voice
    window.speechSynthesis.speak(utterance);
    return Promise.resolve();
  }
  throw new Error('Speech synthesis not supported');
}