import React, { useState, useEffect } from "react";

export default function Camera() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchCameraFrame = async () => {
            try {
                const response = await fetch('/api/get_camera_frame');
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        setImageUrl(`data:image/jpeg;base64,${data.frame}`);
                    }
                }
            } catch (error) {
                console.error('获取摄像头帧失败:', error);
            }
        };

        const intervalId = setInterval(fetchCameraFrame, 100);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="w-full max-w-md mx-auto">
            {imageUrl ? (
                <img src={imageUrl} alt="摄像头画面" className="w-full h-auto rounded-lg shadow-lg" />
            ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg font-[family-name:var(--font-geist-sans)]">
                    <p className="text-gray-500 text-lg">加载摄像头画面中...</p>
                </div>
            )}
        </div>
    );
}
