import React from 'react';
import UIBotton from './UIButton';
import { useLanguage } from '../../context/LanguageContext';

interface StartMenuProps {
    onStart: () => void;
    onSettings: () => void;
    onAbout: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart, onSettings, onAbout }) => {
    const { t } = useLanguage();

    const renderControls = () => {
        const parts = t.controls.split(/(\[.*?\])/g);
        return (
            <div className="absolute bottom-4 text-gray-500 text-sm px-2">
                {parts.map((part, index) => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                        return <span key={index} dir="ltr" className="inline-block mx-1 font-sans bg-gray-700 text-gray-300 px-2 rounded-sm">{part.slice(1, -1)}</span>
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-white text-center bg-gradient-to-b from-indigo-900 to-gray-900">
            <h1 className="text-7xl font-bold mb-4 text-glow text-yellow-300">Magical Library</h1>
            <h2 className="text-5xl font-bold mb-12 animate-pulse text-cyan-400">Adventure</h2>
            <div className="space-y-4">
                <UIBotton onClick={onStart}>{t.startGame}</UIBotton>
                <UIBotton onClick={onSettings}>{t.settings}</UIBotton>
                <UIBotton onClick={onAbout}>{t.about}</UIBotton>
            </div>
             {renderControls()}
        </div>
    );
};

export default StartMenu;