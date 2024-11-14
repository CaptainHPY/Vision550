"use client";

import React, { useState } from "react";
import ThemeButton from "../components/theme/ThemeButton";
import Footer from "../components/Footer";
import { useTheme } from "../components/theme/ThemeContext";
import ChatHistory from "./ChatHistory";
import CallAssistant from "./CallAssistant";
import Camera from "./Camera";

export default function Assistant() {
    const { theme, setTheme } = useTheme();
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
                <CallAssistant onUpdateChatHistory={handleUpdateChatHistory} />
            </div>
            <Footer />
        </div>
    );
}
