'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeContext';
import ThemeButton from '@/components/theme/ThemeButton';
import { logIn } from '@/lib/actions';
import ToggleVisibilityInput from '@/components/ToggleVisibilityInput';
export default function Page() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            await logIn(formData);
            setSuccess('登录成功！即将跳转到首页...');
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
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
                <h2 className="text-2xl font-bold mb-6 text-center">用户登录</h2>
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
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            密码
                        </label>
                        <ToggleVisibilityInput
                            id="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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
                            {loading ? '登录中...' : '登录'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            还没有账号？
                            <span
                                className="text-blue-500 cursor-pointer hover:underline ml-1"
                                onClick={() => router.push('/signup')}
                            >
                                立即注册
                            </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
