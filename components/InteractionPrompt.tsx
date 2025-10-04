import React from 'react';
import { GameObject } from '../types';

interface InteractionPromptProps {
    object: GameObject;
}

const InteractionPrompt: React.FC<InteractionPromptProps> = ({ object }) => {
    const style: React.CSSProperties = {
        left: `${object.x + object.width / 2}px`,
        top: `${object.y - 40}px`,
        position: 'absolute',
        transform: 'translateX(-50%)',
    };

    return (
        <div style={style} className="z-10 flex items-center flex-col animate-bounce">
            <div className="bg-black/70 text-white font-bold rounded-md px-3 py-1 text-lg flex items-center gap-2 border-2 border-white">
                <div className="border border-gray-400 rounded px-2">E</div>
            </div>
             <div className="w-2 h-2 bg-white/70 transform rotate-45 -mt-1"></div>
        </div>
    );
};

export default InteractionPrompt;
