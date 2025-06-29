'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation"
import { getCurrentUser, logOut } from '@/lib/actions';
import KeyInput from './KeyInput';

interface UserProps {
    onLoginStatusChange?: (isLoggedIn: boolean) => void;
    onApiKeyChange?: (isEmpty: boolean) => void;
}

export default function User({ onLoginStatusChange, onApiKeyChange }: UserProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [apiKeyValue, setApiKeyValue] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            const user = await getCurrentUser();
            setIsLoggedIn(user.isLoggedIn);
            if (onLoginStatusChange) {
                onLoginStatusChange(user.isLoggedIn);
            }
            setImage(user.user?.avatarUrl || '/defaultavatar.svg');
            setName(user.user?.name || '');
            setIsLoading(false);
        };
        fetchUser();
    }, [onLoginStatusChange]);

    useEffect(() => {
        if (onApiKeyChange) {
            onApiKeyChange(apiKeyValue === '');
        }
    }, [apiKeyValue, onApiKeyChange]);

    const handleLogout = async () => {
        try {
            await logOut();
            setIsLoggedIn(false);
            setImage('');
            if (onLoginStatusChange) {
                onLoginStatusChange(false);
            }
        } catch (error) {
            console.error('退出登录失败', error);
        }
    };

    const handleApiKeyChange = (value: string) => {
        setApiKeyValue(value);
    };

    return (
        <div className="flex absolute top-2 left-8 font-[family-name:var(--font-geist-sans)]">
            {isLoggedIn ? (
                <div className="drawer" style={{ width: '50px' }}>
                    <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                        <label htmlFor="my-drawer">
                            <Image
                                src={image}
                                width={50}
                                height={50}
                                alt="avatar"
                                className="mask mask-circle drawer-button"
                                unoptimized
                            />
                        </label>
                    </div>
                    <div className="drawer-side">
                        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                        <ul className="menu bg-base-200 text-base-content min-h-full w-100 p-4">
                            <div
                                className="tooltip tooltip-bottom ml-auto" style={{ width: '24px' }}
                                data-tip="您可以同时填入您的GOOGLE_API_KEY和OPENAI_API_KEY，或只填入ANOTHER_MLLM_API_KEY（例如aihubmix，siliconflow等一站式云服务平台）">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <Image
                                src={image}
                                width={50}
                                height={50}
                                alt="avatar"
                                className="mask mask-circle drawer-button block mx-auto"
                                unoptimized
                            />
                            <span className="text-center text-lg font-bold">
                                {name}
                            </span>
                            <a className="text-center mt-2">- - - Fill in - - -</a>
                            <a className="mt-2 ml-2">GOOGLE_API_KEY</a>
                            <input
                                type="text"
                                className="input mt-2"
                            />
                            <a className="mt-4 ml-2">OPENAI_API_KEY</a>
                            <input
                                type="text"
                                className="input mt-2"
                            />
                            <a className="text-center mt-2">- - - or - - -</a>
                            <a className="mt-2 ml-2">ANOTHER_MLLM_API_KEY</a>
                            <KeyInput
                                id="anotherMLLMAPIKey"
                                name="anotherMLLMAPIKey"
                                onValueChange={handleApiKeyChange}
                            />
                            <button
                                className="inline-flex justify-center rounded px-4 py-2 font-medium text-base mt-4 mx-auto
                                            bg-red-600 hover:bg-red-500 border border-red-600 text-white
                                            shadow-sm focus:outline-none focus-visible:ring focus-visible:ring-red-300
                                            scale-100 active:scale-[0.97]
                                            motion-safe:transform-gpu
                                            motion-reduce:hover:brightness-90 transition duration-100 animate-shadow"
                                onClick={handleLogout}
                            >
                                退出登录
                            </button>
                        </ul>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-4">
                        <button
                            className="btn btn-outline"
                            onClick={() => router.push("/signup")}
                            disabled={isLoading}
                        >
                            Sign up
                        </button>
                    </div>
                    <div className="ml-2 mt-4">
                        <button
                            className="btn btn-outline"
                            onClick={() => router.push("/login")}
                            disabled={isLoading}
                        >
                            Log in
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}