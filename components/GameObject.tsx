
import React from 'react';
import { GameObject, GameObjectType, Player } from '../types';

interface GameObjectProps {
    obj: GameObject;
    isCollected?: boolean;
    player?: Player;
    isDefeated?: boolean;
}

const GameObjectComponent: React.FC<GameObjectProps> = ({ obj, isCollected, player, isDefeated }) => {
    const baseStyle: React.CSSProperties = {
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
        position: 'absolute',
        transition: 'opacity 0.5s ease-in-out, transform 0.2s ease-in-out',
    };

    switch (obj.type) {
        case GameObjectType.Platform:
            return <div style={{...baseStyle, opacity: obj.isTriggered ? 0.3 : 1}} className="bg-slate-600 border-b-4 border-slate-800 rounded-sm"></div>;
        case GameObjectType.Book:
            return (
                <div style={baseStyle} className={`transition-opacity duration-500 ${isCollected ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-full h-full relative group">
                        <div className="absolute inset-0 bg-yellow-400 transform scale-110 blur-md opacity-75 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-full h-full bg-yellow-500 border-2 border-yellow-700 rounded-sm flex items-center justify-center">
                           <div className="w-2 h-4 bg-red-700 rounded-full"></div>
                        </div>
                    </div>
                </div>
            );
        case GameObjectType.FinalBook:
            if (obj.isHidden) return null;
            return (
                <div style={baseStyle}>
                    <div className="w-full h-full relative group">
                        <div className="absolute inset-0 bg-cyan-400 transform scale-125 blur-lg opacity-75 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-full h-full bg-slate-800 border-4 border-cyan-300 rounded-md flex items-center justify-center text-glow text-cyan-200 text-3xl">
                           <i className='bx bxs-book-heart'></i>
                        </div>
                    </div>
                </div>
            );
         case GameObjectType.Key:
            return (
                 <div style={baseStyle} className="text-purple-400 flex items-center justify-center">
                     <div className="relative group">
                         <div className="absolute -inset-1 bg-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full relative" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                     </div>
                 </div>
            );
        case GameObjectType.Door:
            return <div style={{...baseStyle, opacity: obj.isTriggered ? 0.5 : 1}} className="bg-amber-800 border-4 border-amber-900 rounded-t-lg flex items-center justify-center transition-opacity"><div className="w-4 h-4 rounded-full bg-gray-500"></div></div>;
        case GameObjectType.Trap:
             return <div style={baseStyle} className="bg-slate-800 rounded-sm border-t-2 border-red-900 flex items-center justify-center p-1"><div className="w-1/2 h-1/2 bg-red-600 rounded-full animate-pulse border-2 border-red-400/50"></div></div>;
        case GameObjectType.PatrollingTrap:
             return <div style={baseStyle} className="bg-purple-600 rounded-full animate-pulse border-2 border-purple-300"><div className="absolute inset-0 bg-purple-400 rounded-full blur-md"></div></div>;
        case GameObjectType.PressurePlate:
            return (<div style={baseStyle}><div className="w-full h-full bg-slate-700 border-b-4 border-slate-900"><div style={{ transform: obj.isTriggered ? 'scaleY(0.5)' : 'scaleY(1)', transformOrigin: 'bottom' }} className="w-full h-full bg-slate-500 transition-transform duration-100"></div></div></div>);
        case GameObjectType.PushableBlock:
            return <div style={baseStyle} className="bg-amber-700 border-4 border-amber-900 rounded-md"></div>;
        case GameObjectType.FallingPlatform:
            const isShaking = obj.fallDelay && obj.fallDelay > 0 && obj.shakeTime && obj.fallDelay < obj.shakeTime;
            return <div style={{...baseStyle, opacity: obj.isFalling ? 0 : 1}} className={`bg-slate-500 border-b-4 border-slate-700 rounded-sm transition-opacity duration-500 ${isShaking ? 'shake-subtle' : ''}`}></div>;
        case GameObjectType.Teleporter:
            return (<div style={baseStyle} className="flex items-center justify-center"><div className="w-full h-full bg-indigo-500 rounded-full animate-pulse opacity-75"><div className="absolute inset-2 bg-indigo-800 rounded-full"></div></div></div>);
        
        // --- Final Level Objects ---
        case GameObjectType.DoubleJumpRune:
            return <div style={{...baseStyle, opacity: isCollected ? 0 : 1}} className="text-lime-300 text-5xl text-glow flex items-center justify-center animate-bounce"><i className='bx bx-wind'></i></div>;
        case GameObjectType.TruthCrystal:
            return <div style={{...baseStyle, opacity: isCollected ? 0 : 1}} className="text-cyan-300 text-5xl text-glow flex items-center justify-center animate-crystal-pulse"><i className='bx bxs-diamond'></i></div>;
        case GameObjectType.Checkpoint:
            return <div style={baseStyle} className="text-yellow-300 text-5xl flex items-center justify-center opacity-60"><i className='bx bxs-save'></i></div>;
        case GameObjectType.HiddenPlatform:
            return <div style={{...baseStyle, opacity: obj.isHidden ? 0.2 : 1}} className="bg-purple-800/50 border-2 border-dashed border-purple-400 rounded-md transition-opacity duration-300"></div>;
        case GameObjectType.Guardian:
            let pupilX = 0, pupilY = 0;
            if (player) {
                const angle = Math.atan2(player.y + player.height / 2 - (obj.y + obj.height / 2), player.x + player.width / 2 - (obj.x + obj.width / 2));
                const pupilRadius = obj.width * 0.1;
                pupilX = Math.cos(angle) * pupilRadius;
                pupilY = Math.sin(angle) * pupilRadius;
            }
            return (
                <div style={baseStyle} className={`flex items-center justify-center ${isDefeated ? 'shake-hard' : 'animate-guardian-float'}`}>
                    {/* Dark energy aura */}
                    <div className="absolute inset-0 bg-purple-500 opacity-30 blur-2xl rounded-full"></div>
                    {/* Orbiting shards */}
                    <div className="absolute w-full h-full animate-[spin_20s_linear_infinite]"><div className="absolute top-0 left-1/2 w-8 h-4 bg-slate-800 border-2 border-purple-400 rounded-sm -translate-x-1/2 -translate-y-1/2"></div></div>
                    <div className="absolute w-full h-full animate-[spin_15s_linear_infinite_reverse]"><div className="absolute bottom-4 right-0 w-6 h-6 bg-slate-800 border-2 border-purple-400 rotate-45"></div></div>
                    {/* Core body - cracked obsidian */}
                    <div className="w-3/4 h-3/4 bg-slate-900 rounded-full border-4 border-purple-600 shadow-2xl shadow-purple-400/50 flex items-center justify-center">
                        {/* Central Eye */}
                        <div className="w-1/2 h-1/2 bg-black rounded-full flex items-center justify-center">
                            <div className="w-1/2 h-1/2 bg-red-600 rounded-full animate-pulse border-2 border-red-300 flex items-center justify-center transition-transform duration-200" style={{ transform: `translate(${pupilX}px, ${pupilY}px)`}}>
                                <div className="w-1/3 h-1/3 bg-black rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case GameObjectType.GuardianAttack:
            if(obj.attackType === 'orb') return <div style={baseStyle} className="bg-fuchsia-500 rounded-full border-4 border-fuchsia-200 shadow-lg shadow-fuchsia-400/50"><div className="w-full h-full bg-black rounded-full scale-50"></div></div>;
            if(obj.attackType === 'rune') return <div style={baseStyle} className="text-red-500 text-5xl text-glow flex items-center justify-center animate-bounce"><i className='bx bxs-hot'></i></div>;
            if(obj.attackType === 'wave') return <div style={{...baseStyle, transformOrigin: 'left'}} className="bg-gradient-to-r from-purple-500 to-transparent animate-energy-wave"></div>;
            if(obj.attackType === 'beam') return <div style={baseStyle} className="bg-gradient-to-r from-yellow-300 via-white to-yellow-300 border-y-4 border-yellow-500 shadow-[0_0_20px_10px_#fef08a]"></div>;
            if(obj.attackType === 'bolt') {
                const angle = (obj.vx || obj.vy) ? Math.atan2(obj.vy!, obj.vx!) * (180 / Math.PI) : 0;
                const direction = (obj.vx ?? 0) < 0 ? -1 : 1;
                return (
                    <div style={{...baseStyle, transform: `rotate(${angle}deg)`}}>
                        <div className="w-full h-full rounded-full"
                             style={{
                                background: `linear-gradient(to right, #fca5a5, #ef4444 50%, #f87171)`,
                                boxShadow: `0 0 8px 2px #ef4444, 0 0 12px 3px #fca5a5, ${direction * -30}px 0 20px -10px #ef4444`,
                             }}
                        >
                        </div>
                    </div>
                )
            }
            return null;
        case GameObjectType.PlayerWeaponPickup:
            return (
                 <div style={baseStyle} className="animate-bounce">
                    <div className="w-full h-full relative group">
                        <div className="absolute inset-0 bg-cyan-400 transform scale-110 blur-lg opacity-75 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-full h-full bg-slate-800 border-2 border-cyan-300 rounded-md flex items-center justify-center text-glow text-cyan-200 text-3xl">
                           <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse border-2 border-purple-300"></div>
                        </div>
                    </div>
                </div>
            )
        case GameObjectType.PlayerProjectile:
            if (obj.isOvercharged) {
                return (
                    <div style={{ ...baseStyle, transform: `scale(${1 + Math.sin(Date.now() / 50) * 0.1})`}}>
                         <div className="w-full h-full rounded-full bg-yellow-400 border-4 border-yellow-200 shadow-[0_0_20px_10px_#fef08a,inset_0_0_10px_#fff]"></div>
                    </div>
                )
            }
            const angle = (obj.vx || obj.vy) ? Math.atan2(obj.vy!, obj.vx!) * (180 / Math.PI) : 0;
            const direction = (obj.vx ?? 0) < 0 ? -1 : 1;
            return (
                <div style={{...baseStyle, transform: `rotate(${angle}deg)`}}>
                    <div className="w-full h-full rounded-full"
                         style={{
                            background: `linear-gradient(to right, #f0abfc, #a855f7 50%, #d8b4fe)`,
                            boxShadow: `0 0 8px 2px #a855f7, 0 0 12px 3px #f0abfc, ${direction * -30}px 0 20px -10px #a855f7`,
                         }}
                    >
                    </div>
                </div>
            )
        default:
            return <div style={baseStyle} className="bg-red-500"></div>;
    }
};

export default GameObjectComponent;
