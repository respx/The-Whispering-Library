import React from 'react';
import UIBotton from './UIButton';
import { useLanguage } from '../../context/LanguageContext';

interface PauseMenuProps {
    onResume: () => void;
    onRestart: () => void;
    onSettings: () => void;
    onExit: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onSettings, onExit }) => {
    const { t } = useLanguage();

    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
            <h2 className="text-6xl font-bold mb-8 text-glow text-cyan-300">{t.paused}</h2>
            <div className="space-y-4">
                <UIBotton onClick={onResume}>{t.resume}</UIBotton>
                <UIBotton onClick={onRestart}>{t.restartLevel}</UIBotton>
                <UIBotton onClick={onSettings}>{t.settings}</UIBotton>
                <UIBotton onClick={onExit}>{t.exitToMenu}</UIBotton>
            </div>
        </div>
    );
};

export default PauseMenu;
