
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const FinalBattleIntro: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center pointer-events-none z-50 animate-final-intro">
            <h1 className="text-8xl font-bold text-white text-glow text-red-500 shake-hard">{t.finalBattle}</h1>
        </div>
    );
};

export default FinalBattleIntro;
