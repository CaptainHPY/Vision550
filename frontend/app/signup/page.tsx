'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeContext';
import ThemeButton from '@/components/theme/ThemeButton';
import AuthForm from '@/components/AuthForm';
import { signUp, getUserByName } from '@/lib/actions';

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

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (await getUserByName(name) !== undefined) {
                throw new Error("该用户名已被使用");
            }
            const formData = new FormData(e.target as HTMLFormElement);
            await signUp(formData);
            setSuccess('注册成功！即将跳转到首页...');
            setTimeout(() => router.push('/'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-hypixel)]" data-theme={theme}>
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                <ThemeButton onToggle={toggleTheme} />
            </div>
            <AuthForm
                title="用户注册"
                showAvatar
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                success={success}
                name={name}
                setName={setName}
                password={password}
                setPassword={setPassword}
                previewUrl={previewUrl}
                handleFileChange={handleFileChange}
                fileInputRef={fileInputRef}
                submitText="注册"
                onBack={() => router.push('/')}
            />
        </div>
    );
}