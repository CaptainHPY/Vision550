import { useState, useEffect } from 'react';
import ToggleVisibilityInput from '../ToggleVisibilityInput';

interface KeyInputProps {
    id: string;
    name: string;
    onValueChange?: (value: string) => void;
}

export default function KeyInput({ id, name, onValueChange }: KeyInputProps) {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const savedApiKey = localStorage.getItem(`api_key`);
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
    }, []);

    useEffect(() => {
        if (onValueChange) {
            onValueChange(apiKey);
        }
    }, [apiKey, onValueChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
    };

    const handleSaveApiKey = () => {
        localStorage.setItem(`api_key`, apiKey);
        console.log("保存成功！");
    };

    return (
        <div className="flex items-center gap-2 mt-2">
            <ToggleVisibilityInput
                id={id}
                name={name}
                className="input"
                value={apiKey}
                onChange={handleChange}
                required
            />
            <button
                className="btn btn-soft"
                onClick={handleSaveApiKey}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" />
                    <path d="M10 8v3m0 0v3m0-3h3m-3 0H7" fillRule="nonzero" />
                </svg>
            </button>
        </div>
    );
}