import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialogue } from '../types';
import audioService from '../services/audioService';
import { useLanguage } from '../context/LanguageContext';

interface DialogueBoxProps {
    dialogue: Dialogue;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [shake, setShake] = useState(false);
    const { t, direction } = useLanguage();
    // FIX: Replaced `NodeJS.Timeout` with `number` as it's the correct type for `setInterval` in a browser environment.
    const intervalIdRef = useRef<number | null>(null);

    useEffect(() => {
        setDisplayedText('');
        setIsComplete(false);
        setShake(true);
        setTimeout(() => setShake(false), 200);

        let charIndex = 0;
        intervalIdRef.current = setInterval(() => {
            if (charIndex < dialogue.text.length) {
                setDisplayedText(prev => prev + dialogue.text[charIndex]);
                if(dialogue.text[charIndex] !== ' ') {
                   audioService.playBeep();
                }
                charIndex++;
            } else {
                if (intervalIdRef.current) clearInterval(intervalIdRef.current);
                setIsComplete(true);
            }
        }, 30);

        return () => {
            if (intervalIdRef.current) clearInterval(intervalIdRef.current);
        };
    }, [dialogue]);

    const handleInteraction = useCallback(() => {
        if (isComplete) {
            dialogue.onDialogueEnd();
        } else {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            setDisplayedText(dialogue.text);
            setIsComplete(true);
        }
    }, [isComplete, dialogue]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleInteraction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleInteraction]);
    
    const formatText = (text: string) => {
        return text.split(/(\*[^*]+\*)/g).map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return <strong key={index} className="text-yellow-300 text-glow">{part.slice(1, -1)}</strong>;
            }
            return part;
        });
    };

    const renderContinuePrompt = () => {
        const parts = t.continuePrompt.split(/(\[.*?\])/g);
         return (
             <div className="text-center text-sm text-gray-400 animate-pulse">
                {parts.map((part, index) => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                        return <span key={index} dir="ltr" className="inline-block mx-1 font-sans bg-gray-700 text-gray-300 px-2 rounded-sm">{part.slice(1, -1)}</span>
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
    }

    const guardianTextStyle = dialogue.isGuardian ? 'text-yellow-300 text-glow shake-subtle' : '';

    return (
        <div 
            className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/80 border-t-4 border-cyan-400 p-6 text-white text-2xl flex flex-col cursor-pointer"
            onClick={handleInteraction}
            dir={direction}
        >
            <div className={`p-4 border-2 border-gray-600 rounded-lg h-full flex flex-col ${shake ? 'shake-subtle' : ''}`}>
                <h3 className={`font-bold mb-2 ${dialogue.isGuardian ? 'text-yellow-400' : 'text-cyan-400'}`}>{dialogue.title} - <span className="text-gray-400">{dialogue.character}</span></h3>
                <p className={`flex-grow whitespace-pre-wrap leading-relaxed ${guardianTextStyle}`}>{formatText(displayedText)}</p>
                {isComplete && renderContinuePrompt()}
            </div>
        </div>
    );
};

export default DialogueBox;