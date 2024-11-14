"use client";

import React, { useState } from "react";
import { ReactTyped } from "react-typed";
import Footer from "./components/Footer";
import ThemeButton from "./components/theme/ThemeButton";
import { useRouter } from 'next/navigation';
import { useTheme } from "./components/theme/ThemeContext";

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [firstTypingComplete, setFirstTypingComplete] = useState(false);
  const [secondTypingComplete, setSecondTypingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleStartClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/start_webcam', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/assistant');
      } else {
        console.error('启动摄像头失败');
      }
    } catch (error) {
      console.error('请求错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-hypixel)]"
      data-theme={theme}
    >
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <ThemeButton onToggle={toggleTheme} />
      </div>

      <div className="flex flex-col gap-8 items-center">
        <div className="text-6xl text-center font-[family-name:var(--font-hypixel)] mt-[60px]">
          <div className="mb-2 flex items-center justify-center">
            <ReactTyped
              strings={["VISION550"]}
              typeSpeed={200}
              showCursor={false}
              onComplete={() => setFirstTypingComplete(true)}
            />
            {!firstTypingComplete && (
              <span className="ml-2">_</span>
            )}
          </div>
          <div className="flex justify-center">
            <ReactTyped
              showCursor={firstTypingComplete}
              strings={["——智能语音通话助手"]}
              typeSpeed={200}
              cursorChar="_"
              startDelay={2400}
              onComplete={() => setSecondTypingComplete(true)}
            />
          </div>
        </div>
        {secondTypingComplete && (
          <div className="flex gap-4 items-center flex-col sm:flex-row mt-8 sm:mt-12 md:mt-16 font-[family-name:var(--font-geist-sans)]">
            <button
              className='inline-flex rounded px-6 py-3 font-bold text-lg sm:text-xl md:text-2xl 
              border border-gray-300 shadow-sm 
              dark:border-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-300 
              scale-100 hover:scale-[1.03] active:scale-[0.97] motion-safe:transform-gpu 
              motion-reduce:hover:scale-100 motion-reduce:hover:brightness-90 transition duration-100 animate-shadow'
              onClick={handleStartClick}
              disabled={isLoading}
            >
              {isLoading ? '正在启动...' : '开始使用'}
            </button>
          </div>
        )}
      </div>
      {secondTypingComplete && (
        <Footer />
      )}
    </div>
  );
}
