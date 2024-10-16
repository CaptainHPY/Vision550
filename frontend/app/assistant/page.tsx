"use client";

import React, { useState } from "react";
import ThemeButton from "../components/theme/ThemeButton";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import { useTheme } from "../components/theme/ThemeContext";
import ChatHistory from "./ChatHistory";
import CallAssistant from "./CallAssistant";
import Camera from "./Camera";

export default function Assistant() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [isStopping, setIsStopping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'assistant'; content: string; }>>([
        { sender: 'assistant', content: '您好，我是Vision550。' },
    ]);

    const handleUpdateChatHistory = (newMessage: { sender: 'user' | 'assistant'; content: string }) => {
        setChatHistory(prev => [...prev, newMessage]);
        if (newMessage.sender === 'user') {
            setIsLoading(true);
          } else {
            setIsLoading(false);
        }
    };

    const handleStopClick = async () => {
        setIsStopping(true);
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
            setIsStopping(false);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-hypixel)]"
            data-theme={theme}
        >
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                <ThemeButton onToggle={toggleTheme} />
            </div>

            <div className="flex flex-col gap-8 items-center justify-center text-6xl text-center font-[family-name:var(--font-hypixel)]">
                <h1>VISION550准备就绪</h1>
                <Camera />
                <h2>聊天记录</h2>
                <ChatHistory messages={chatHistory} isLoading={isLoading} />
                <div className="flex gap-4 items-center flex-col sm:flex-row font-[family-name:var(--font-geist-sans)]">
                    <button
                        className='inline-flex rounded px-6 py-3 font-bold text-lg sm:text-xl md:text-2xl 
                        border border-gray-300 
                        shadow-sm dark:border-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-300 
                        scale-100 hover:scale-[1.03] active:scale-[0.97] motion-safe:transform-gpu motion-reduce:hover:scale-100 
                        motion-reduce:hover:brightness-90 transition duration-100 animate-shadow'
                        onClick={handleStopClick}
                        disabled={isStopping}
                    >
                        {isStopping ? '正在关闭...' : '返回主页'}
                    </button>
                    <CallAssistant onUpdateChatHistory={handleUpdateChatHistory} />
                </div>
            </div>
            <Footer />
        </div>
    );
}
