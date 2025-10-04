import React from 'react';
import UIBotton from './UIButton';
import { StoryFragment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface LevelCompleteScreenProps {
    collectedFragments: StoryFragment[];
    onNextLevel: () => void;
    onExit: () => void;
    isNextLevelFinal: boolean;
}

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({ collectedFragments, onNextLevel, onExit, isNextLevelFinal }) => {
    const { t } = useLanguage();
    return (
        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-white text-center bg-gradient-to-b from-purple-900 to-gray-900">
            <h1 className="text-6xl font-bold mb-4 text-glow text-green-300">{t.chamberCleared}</h1>
            <div className="my-6 p-4 bg-black/30 rounded-lg max-w-2xl h-64 overflow-y-auto border border-gray-600">
                <h2 className="text-2xl font-bold mb-4 text-yellow-300">{t.storyFragments}:</h2>
                {collectedFragments.length > 0 ? (
                    <ul className="space-y-2 text-left">
                        {collectedFragments.map(fragment => (
                            <li key={fragment.id} className="text-gray-300 italic">"{fragment.text}"</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">{t.noNewFragments}</p>
                )}
            </div>
            <div className="flex space-x-4">
                 <UIBotton onClick={onNextLevel}>
                    {isNextLevelFinal ? t.proceedToFinal : t.nextLevel}
                </UIBotton>
                <UIBotton onClick={onExit}>{t.exitToMenu}</UIBotton>
            </div>
        </div>
    );
};

export default LevelCompleteScreen;