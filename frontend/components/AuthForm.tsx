'use client';

import React from 'react';
import ToggleVisibilityInput from './ToggleVisibilityInput';

interface AuthFormProps {
    title: string;
    showAvatar?: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    loading: boolean;
    error: string;
    success: string;
    name: string;
    setName: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    previewUrl?: string | null;
    handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef?: React.RefObject<HTMLInputElement>;
    submitText: string;
    backText?: string;
    onBack: () => void;
    children?: React.ReactNode;
}

export default function AuthForm({
    title,
    showAvatar = false,
    onSubmit,
    loading,
    error,
    success,
    name,
    setName,
    password,
    setPassword,
    previewUrl,
    handleFileChange,
    fileInputRef,
    submitText,
    backText = '返回',
    onBack,
    children,
}: AuthFormProps) {
    return (
        <div className="max-w-md mx-auto mt-10 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
            <form onSubmit={onSubmit}>
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

                {showAvatar && (
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">头像</label>
                        <div className="flex items-center space-x-4">
                            <div
                                className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-full overflow-hidden"
                                onClick={() => fileInputRef?.current?.click()}
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
                            <div className="text-sm text-gray-500">点击左侧区域上传头像图片</div>
                        </div>
                    </div>
                )}

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

                {children}

                <div className="flex justify-center gap-4">
                    <button
                        className="flex-1 btn btn-outline"
                        type="button"
                        onClick={onBack}
                    >
                        {backText}
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? `${submitText}中...` : submitText}
                    </button>
                </div>
            </form>
        </div>
    );
}