'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeContext';
import ThemeButton from '@/components/theme/ThemeButton';
import ToggleVisibilityInput from '@/components/ToggleVisibilityInput';
import { signUp, isUserExisted } from '@/lib/actions';

export default function Page() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (await isUserExisted(name)) {
                throw new Error("该用户名已被使用");
            }
            const formData = new FormData(e.target as HTMLFormElement);
            await signUp(formData);

            setSuccess('注册成功！即将跳转到首页...');
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-hypixel)]"
            data-theme={theme}
        >
            <div className="max-w-md mx-auto mt-10 p-6 rounded-lg shadow-md">
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                    <ThemeButton onToggle={toggleTheme} />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center">用户注册</h2>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="name">
                            用户名
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            头像
                        </label>
                        <div className="flex items-center space-x-4">
                            <div
                                className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-full overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="头像预览" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400">点击上传</span>
                                )}
                            </div>
                            <input
                                name="avatar"
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className="text-sm text-gray-500">
                                点击左侧区域上传头像图片
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            密码
                        </label>
                        <ToggleVisibilityInput
                            id="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            className="flex-1 btn btn-outline"
                            onClick={() => router.push('/')}>
                            返回
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? '注册中...' : '注册'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
