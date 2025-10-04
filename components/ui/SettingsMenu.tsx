import React, { useState, useEffect } from 'react';
import UIBotton from './UIButton';
import audioService from '../../services/audioService';
import { useLanguage } from '../../context/LanguageContext';

interface SettingsMenuProps {
    onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
    const [masterVolume, setMasterVolume] = useState(audioService.getMasterVolume());
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        audioService.setMasterVolume(masterVolume);
    }, [masterVolume]);

    const LanguageButton: React.FC<{lang: 'en' | 'ar', children: React.ReactNode}> = ({ lang, children }) => {
        const isActive = language === lang;
        return (
            <button
                onClick={() => setLanguage(lang)}
                className={`px-6 py-2 border-2 rounded-md font-bold transition-all duration-200 ${
                    isActive
                        ? 'bg-cyan-400 text-gray-900 border-cyan-400'
                        : 'bg-gray-700 text-cyan-300 border-gray-600 hover:bg-gray-600'
                }`}
            >
                {children}
            </button>
        );
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
            <div className="bg-gray-800 p-8 rounded-lg border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 w-1/2">
                <h2 className="text-4xl font-bold mb-8 text-center text-glow text-cyan-300">{t.settings}</h2>
                
                <div className="mb-6">
                    <label htmlFor="volume" className="block mb-2 text-lg">{t.masterVolume}</label>
                    <input
                        id="volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={masterVolume}
                        onChange={(e) => setMasterVolume(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                </div>

                <div className="mb-8">
                    <label className="block mb-2 text-lg">{t.language}</label>
                    <div className="flex justify-center gap-4">
                        <LanguageButton lang="en">{t.english}</LanguageButton>
                        <LanguageButton lang="ar">{t.arabic}</LanguageButton>
                    </div>
                </div>

                <div className="text-center">
                    <UIBotton onClick={onClose}>{t.back}</UIBotton>
                </div>
            </div>
        </div>
    );
};

export default SettingsMenu;
