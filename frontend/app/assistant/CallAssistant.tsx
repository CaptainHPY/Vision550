import React, { useState, useRef } from 'react';
import audioBufferToWav from 'audiobuffer-to-wav';

interface CallAssistantProps {
  onUpdateChatHistory: (newMessage: { sender: 'user' | 'assistant'; content: string }) => void;
}

const CallAssistant: React.FC<CallAssistantProps> = ({ onUpdateChatHistory }) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const recognizeSpeech = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    try {
      const response = await fetch('/api/recognize_speech', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || '请求错误');
            } else {
                throw new Error(`HTTP错误 ${response.status}`);
            }
        }

      const data = await response.json();
      return data.text;
    } catch (error) {
        if (error instanceof Error) {
            console.error('语音识别错误:', error.message);
        } else {
            console.error('发生未知错误');
        }
        return '';
    }
  };

  const callAssistant = async (prompt: string) => {
    try {
      const response = await fetch('/api/call_assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('调用助手失败');
      }

      const audioBlob = await response.blob();
      const encodedTextResponse = response.headers.get('X-Text-Response');
      
      // 解码 Base64 编码的文本响应
      const textResponse = encodedTextResponse 
        ? decodeURIComponent(escape(atob(encodedTextResponse)))
        : '';

      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(e => console.error('音频播放失败:', e));
      }

        return textResponse;
    } catch (error) {
      console.error('调用助手错误:', error);
      return '';
    }
  };

  const handleCallAssistant = async () => {
    setIsCollecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const audioChunks: BlobPart[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.start();

      await new Promise(resolve => setTimeout(resolve, 5000));

      mediaRecorder.stop();

      const audioBlob = await new Promise<Blob>(resolve => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          resolve(audioBlob);
        });
      });

      const wavBlob = await convertWebmToWav(audioBlob);

      const recognizedText = await recognizeSpeech(wavBlob);

      if (recognizedText) {
        onUpdateChatHistory({ sender: 'user', content: recognizedText });
        const assistantResponse = await callAssistant(recognizedText);
        onUpdateChatHistory({ sender: 'assistant', content: assistantResponse });
      }
    } catch (error) {
      console.error('处理错误:', error);
      setIsCollecting(false);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      onUpdateChatHistory({ sender: 'assistant', content: errorMessage });
      }
    setIsCollecting(false);
  };

  const convertWebmToWav = async (webmBlob: Blob): Promise<Blob> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

return (
    <>
      <button
        className="inline-flex rounded px-6 py-3 font-bold text-lg sm:text-xl md:text-2xl 
                  bg-red-600 hover:bg-red-500 border border-red-600 text-white
                  shadow-sm focus:outline-none focus-visible:ring focus-visible:ring-red-300 
                  scale-100 hover:scale-[1.03] active:scale-[0.97] 
                  motion-safe:transform-gpu motion-reduce:hover:scale-100 
                  motion-reduce:hover:brightness-90 transition duration-100 animate-shadow"
        onClick={handleCallAssistant}
        disabled={isCollecting}
      >
        {isCollecting ? '正在采集...' : '呼叫Vision550'}
      </button>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </>
  );
};

export default CallAssistant;
