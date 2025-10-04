
import React from 'react';
import audioService from '../../services/audioService';

interface UIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const UIBotton: React.FC<UIButtonProps> = ({ children, onClick, ...props }) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        audioService.playClick();
        if (onClick) {
            onClick(e);
        }
    };

    const handleMouseEnter = () => {
        audioService.playHover();
    };

    return (
        <button
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            className="px-8 py-3 bg-gray-800 text-cyan-300 border-2 border-cyan-400 rounded-md text-2xl font-bold
                       hover:bg-cyan-400 hover:text-gray-900 hover:shadow-lg hover:shadow-cyan-400/50
                       transform hover:-translate-y-1 transition-all duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50"
            {...props}
        >
            {children}
        </button>
    );
};

export default UIBotton;
