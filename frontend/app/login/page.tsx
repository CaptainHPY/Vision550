'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeContext';
import ThemeButton from '@/components/theme/ThemeButton';
import AuthForm from '@/components/AuthForm';
import { logIn, passwordMatch } from '@/lib/actions';

export default function Page() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await passwordMatch(name, password);
        if (!result || !result.success) {
            setError(result?.message || '登录失败，请稍后重试');
        }
        else {
            const formData = new FormData(e.target as HTMLFormElement);
            await logIn(formData);
            setSuccess('登录成功！即将跳转到首页...');
            setTimeout(() => router.push('/'), 2000);
        }
        setLoading(false);
    };

    return (
        <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-hypixel)]" data-theme={theme}>
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                <ThemeButton onToggle={toggleTheme} />
            </div>
            <AuthForm
                title="用户登录"
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                success={success}
                name={name}
                setName={setName}
                password={password}
                setPassword={setPassword}
                submitText="登录"
                onBack={() => router.push('/')}
            >
                <div className="text-center">
                    <p className="mb-2 text-sm text-gray-600">
                        还没有账号？
                        <span
                            className="text-blue-500 cursor-pointer hover:underline ml-1"
                            onClick={() => router.push('/signup')}
                        >
                            立即注册
                        </span>
                    </p>
                </div>
            </AuthForm>
        </div>
    );
}