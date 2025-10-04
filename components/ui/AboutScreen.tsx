import React from 'react';
import UIBotton from './UIButton';
import { useLanguage } from '../../context/LanguageContext';
import audioService from '../../services/audioService';

interface AboutScreenProps {
    onClose: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onClose }) => {
    const { t, direction } = useLanguage();

    const SocialLink: React.FC<{ href: string; icon: string }> = ({ href, icon }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-5xl text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            onMouseEnter={() => audioService.playHover()}
        >
            <i className={icon}></i>
        </a>
    );

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white" dir={direction}>
            <div className="bg-gray-800 p-8 rounded-lg border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 w-3/4 max-w-4xl text-center flex flex-col items-center">
                <h1 className="text-5xl font-bold mb-2 text-glow text-yellow-300">{t.aboutGameTitle}</h1>
                <p className="text-lg text-gray-400 mb-6">{t.aboutDeveloper}</p>

                <div className="text-left max-w-2xl my-4 text-gray-300 space-y-4 leading-relaxed h-80 overflow-y-auto pr-4">
                    <p>{t.aboutDescription}</p>
                    <h2 className="text-2xl font-bold pt-4 text-cyan-300">{t.aboutExperienceTitle}</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        {t.aboutExperiencePoints.map((point, index) => <li key={index}>{point}</li>)}
                    </ul>
                    <h2 className="text-2xl font-bold pt-4 text-cyan-300">{t.aboutConnectTitle}</h2>
                    <p>{t.aboutConnectDescription}</p>
                </div>
                
                <div className="flex space-x-8 my-6">
                    <SocialLink href="https://www.youtube.com/@JAMECHX" icon="bx bxl-youtube" />
                    <SocialLink href="https://x.com/PythonC12590" icon="bx bxl-twitter" />
                </div>
                
                <UIBotton onClick={onClose}>{t.back}</UIBotton>
            </div>
        </div>
    );
};

export default AboutScreen;