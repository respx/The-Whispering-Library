
import React from 'react';
import UIBotton from './UIButton';
import { useLanguage } from '../../context/LanguageContext';
import audioService from '../../services/audioService';

interface EndingScreenProps {
    onExit: () => void;
}

const EndingScreen: React.FC<EndingScreenProps> = ({ onExit }) => {
    const { t, direction } = useLanguage();

    const SocialLink: React.FC<{ href: string; icon: string }> = ({ href, icon }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-4xl text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            onMouseEnter={() => audioService.playHover()}
        >
            <i className={icon}></i>
        </a>
    );

    return (
        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-white text-center bg-gradient-to-b from-indigo-900 to-black" dir={direction}>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <h1 className="text-7xl font-bold mb-4 text-glow text-yellow-300">{t.libraryRestored}</h1>
            </div>

            <div className="my-6 p-4 max-w-3xl text-lg leading-relaxed text-gray-300 animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
                <p>{t.endingMessage}</p>
            </div>

            <div className="my-8 text-center animate-fade-in-up" style={{ animationDelay: '2.5s' }}>
                <h2 className="text-2xl text-cyan-300">{t.developer}</h2>
                <p className="text-4xl font-bold">Jamechx</p>
                <div className="flex justify-center space-x-6 mt-4">
                    <SocialLink href="https://www.youtube.com/@JAMECHX" icon="bx bxl-youtube" />
                    <SocialLink href="https://x.com/PythonC12590" icon="bx bxl-twitter" />
                </div>
            </div>

            <div className="my-4 text-center animate-fade-in-up" style={{ animationDelay: '3.5s' }}>
                 <h2 className="text-2xl text-cyan-300">{t.specialThanks}</h2>
                <p className="text-4xl font-bold">{t.you}</p>
            </div>

            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '4.5s' }}>
                <UIBotton onClick={onExit}>{t.exitToMenu}</UIBotton>
            </div>
        </div>
    );
};

export default EndingScreen;
