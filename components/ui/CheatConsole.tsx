import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface CheatConsoleProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const CheatConsole: React.FC<CheatConsoleProps> = ({ value, onChange, onSubmit, onClose }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { direction } = useLanguage();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div 
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-[#1a1a1a] p-4 rounded-lg border-2 border-green-500 shadow-lg shadow-green-500/30 w-1/3"
                onClick={e => e.stopPropagation()}
                dir={direction}
            >
                <form onSubmit={onSubmit}>
                    <label htmlFor="cheat" className="block text-green-400 font-mono mb-2">
                        &gt; Enter Command:
                    </label>
                    <input
                        id="cheat"
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={onChange}
                        className="w-full bg-black text-green-300 font-mono p-2 border border-green-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoComplete="off"
                        spellCheck="false"
                    />
                </form>
            </div>
        </div>
    );
};

export default CheatConsole;
