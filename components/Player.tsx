import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';

interface PlayerProps {
    player: Player;
    isDoubleJumping?: boolean;
    mousePos?: { x: number; y: number };
    camera?: { x: number; y: number };
}

const PlayerComponent: React.FC<PlayerProps> = ({ player, isDoubleJumping, mousePos, camera }) => {
    const [isLanding, setIsLanding] = useState(false);
    const [nameIsLanding, setNameIsLanding] = useState(false);
    const prevOnGround = useRef(player.onGround);

    useEffect(() => {
        if (!prevOnGround.current && player.onGround) {
            setIsLanding(true);
            setNameIsLanding(true);
            const landTimer = setTimeout(() => setIsLanding(false), 200); // Animation duration for body
            const nameLandTimer = setTimeout(() => setNameIsLanding(false), 300); // Animation duration for name
            return () => {
                clearTimeout(landTimer);
                clearTimeout(nameLandTimer);
            };
        }
        prevOnGround.current = player.onGround;
    }, [player.onGround]);

    const isRunning = player.onGround && Math.abs(player.vx) > 0.1;
    const isJumping = !player.onGround;
    
    let bodyAnimationClass = '';
    if (isLanding) {
        bodyAnimationClass = 'animate-land';
    } else if (isDoubleJumping) {
        bodyAnimationClass = 'animate-double-jump';
    } else if (!isJumping && !isRunning) {
        bodyAnimationClass = 'animate-idle';
    }

    // Physics-based squash and stretch for jumping/falling
    const stretch = isJumping ? Math.min(0.2, Math.abs(player.vy) / 60) : 0;
    const bodyScaleY = 1 + stretch;
    const bodyScaleX = 1 - stretch;

    // Physics-based eye movement
    const pupilOffsetX = -Math.max(-4, Math.min(4, player.vx * 0.5));
    const pupilOffsetY = Math.max(-4, Math.min(4, player.vy * 0.3));

    const scaleX = player.direction === 'left' ? -1 : 1;

    // Physics and animation for name tag
    const nameTilt = -player.vx * 2.5; // Tilt based on horizontal velocity
    const nameLag = player.vy * 0.6;  // Lag based on vertical velocity
    const nameAnimationClasses = [
        'animate-name-glow',
        nameIsLanding ? 'animate-name-land' : '',
        (!isJumping && !isRunning && !nameIsLanding) ? 'animate-name-float' : ''
    ].filter(Boolean).join(' ');

    const isInvulnerable = player.invulnerableTimer > 0;

    // Weapon rotation logic
    let weaponAngle = 0;
    if (player.hasWeapon && mousePos && camera) {
        const weaponPivotX = player.x + player.width / 2;
        const weaponPivotY = player.y + player.height / 2;
        const mouseGameX = mousePos.x + camera.x;
        const mouseGameY = mousePos.y + camera.y;
        const angleRad = Math.atan2(mouseGameY - weaponPivotY, mouseGameX - weaponPivotX);
        weaponAngle = angleRad * (180 / Math.PI);
    }

    return (
        <div
            className="absolute"
            style={{
                left: player.x,
                top: player.y,
                width: player.width,
                height: player.height,
                pointerEvents: 'none',
                opacity: isInvulnerable && Math.floor(player.invulnerableTimer / 5) % 2 === 0 ? 0.5 : 1,
            }}
        >
             {/* Name Tag */}
            <div 
                className="absolute -top-8 w-full flex items-center justify-center transition-transform duration-100 ease-linear"
                style={{
                    transform: `translateY(${nameLag}px) rotate(${nameTilt}deg)`,
                }}
            >
                <span className={`text-xl font-bold tracking-wider ${nameAnimationClasses}`}>
                    Lumin
                </span>
            </div>
            
            {/* Weapon - Rendered separately to allow independent rotation */}
            {player.hasWeapon && (
                 <div 
                    className="absolute w-16 h-8 top-1/2 left-1/2 origin-left" 
                    style={{
                        transform: `translate(-8px, -8px) rotate(${weaponAngle}deg)`,
                        transformOrigin: '16px 16px',
                    }}
                >
                    {/* Gun Body */}
                    <div className="w-12 h-6 bg-slate-700 border-2 border-slate-500 rounded-sm"></div>
                    {/* Glowing Barrel */}
                    <div className="absolute right-0 w-6 h-6 bg-purple-600 rounded-sm shadow-[0_0_15px_#a855f7,0_0_25px_#a855f7] border-2 border-purple-300"></div>
                </div>
            )}

            <div 
                className="w-full h-full relative"
                style={{ transform: `scaleX(${scaleX})` }}
            >
                <div className={`w-full h-full origin-bottom ${bodyAnimationClass}`}>
                    {/* Player Body */}
                    <div
                        className={`w-full h-full bg-pink-500 rounded-t-lg transition-transform duration-100 shadow-lg`}
                        style={{ transform: `scaleY(${bodyScaleY}) scaleX(${bodyScaleX})` }}
                    >
                        {/* Player Eyes */}
                        <div className="absolute top-1/4 w-full flex justify-around px-[10%] animate-blink">
                            {/* Left Eye */}
                            <div className="w-2/5 aspect-square bg-white rounded-full flex items-center justify-center relative shadow-inner">
                                <div 
                                    className="w-1/2 h-1/2 bg-black rounded-full relative transition-transform duration-75"
                                    style={{ transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)` }}
                                >
                                    <div className="w-1/3 h-1/3 bg-gray-200 rounded-full absolute top-[20%] left-[20%]"></div> {/* Shine */}
                                </div>
                            </div>
                            {/* Right Eye */}
                            <div className="w-2/5 aspect-square bg-white rounded-full flex items-center justify-center relative shadow-inner">
                                 <div 
                                    className="w-1/2 h-1/2 bg-black rounded-full relative transition-transform duration-75"
                                    style={{ transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)` }}
                                >
                                    <div className="w-1/3 h-1/3 bg-gray-200 rounded-full absolute top-[20%] left-[20%]"></div> {/* Shine */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerComponent;