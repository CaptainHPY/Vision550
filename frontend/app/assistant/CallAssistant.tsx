import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import audioBufferToWav from 'audiobuffer-to-wav';
import { updateChatHistory } from '@/lib/actions';

interface CallAssistantProps {
  onUpdateChatHistory: (newMessage: { sender: 'user' | 'assistant'; content: string }) => void;
}

const CallAssistant: React.FC<CallAssistantProps> = ({ onUpdateChatHistory }) => {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const recognizeData = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    try {
      const response = await fetch('/api/recognize_data', {
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
          ...(apiKey ? { 'X-API-Key': apiKey } : {})
        },
        body: JSON.stringify({ prompt, apiKey }),
      });

      if (!response.ok) {
        throw new Error('调用助手失败');
      }

      const audioBlob = await response.blob();
      const encodedTextResponse = response.headers.get('X-Text-Response');

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
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorderRef.current.start();
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        setIsRecording(true);
      } catch (error) {
        console.error('获取音频流失败:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        const newMessage = { sender: 'assistant' as const, content: errorMessage };
        onUpdateChatHistory(newMessage);
        await updateChatHistory(newMessage);
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = async () => {
          setIsRecording(false);
          try {
            setIsRecognizing(true);
            const wavBlob = await convertWebmToWav(audioChunksRef.current[0]);

            const recognizedText = await recognizeData(wavBlob);
            setIsRecognizing(false);

            if (recognizedText) {
              setIsProcessing(true);
              const userMessage = { sender: 'user' as const, content: recognizedText };
              onUpdateChatHistory(userMessage);
              await updateChatHistory(userMessage);

              const assistantResponse = await callAssistant(recognizedText);
              const assistantMessage = { sender: 'assistant' as const, content: assistantResponse };
              onUpdateChatHistory(assistantMessage);
              await updateChatHistory(assistantMessage);

              setIsProcessing(false);
            }
          } catch (error) {
            console.error('处理录音错误:', error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            const newMessage = { sender: 'assistant' as const, content: errorMessage };
            onUpdateChatHistory(newMessage);
            await updateChatHistory(newMessage);

            setIsRecording(false);
            setIsRecognizing(false);
            setIsProcessing(false);
          }
        };
      }
    }
  };

  const handleStopClick = async () => {
    setIsClosing(true);
    try {
      const response = await fetch('/api/stop_webcam', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/');
      } else {
        console.error('停止摄像头失败');
      }
    } catch (error) {
      console.error('请求错误:', error);
    } finally {
      setIsClosing(false);
    }
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
    <div className="flex gap-4 items-center flex-col sm:flex-row font-[family-name:var(--font-geist-sans)]">
      <button
        className='inline-flex rounded px-6 py-3 font-bold text-lg sm:text-xl md:text-2xl 
                        border border-gray-300 
                        shadow-sm dark:border-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-300 
                        scale-100 hover:scale-[1.03] active:scale-[0.97] motion-safe:transform-gpu motion-reduce:hover:scale-100 
                        motion-reduce:hover:brightness-90 transition duration-100 animate-shadow'
        onClick={handleStopClick}
        disabled={isRecording || isRecognizing || isProcessing || isClosing}
      >
        {isClosing ? '正在关闭...' : '返回主页'}
      </button>
      <button
        className="inline-flex rounded px-6 py-3 font-bold text-lg sm:text-xl md:text-2xl 
                  bg-red-600 hover:bg-red-500 border border-red-600 text-white
                  shadow-sm focus:outline-none focus-visible:ring focus-visible:ring-red-300 
                  scale-100 hover:scale-[1.03] active:scale-[0.97] 
                  motion-safe:transform-gpu motion-reduce:hover:scale-100 
                  motion-reduce:hover:brightness-90 transition duration-100 animate-shadow"
        onClick={handleCallAssistant}
        disabled={isRecognizing || isProcessing || isClosing}
      >
        {isRecording ? '停止录音' : isRecognizing ? '识别信息中...' : isProcessing ? '处理中...' : '呼叫Vision550'}
      </button>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CallAssistant;
