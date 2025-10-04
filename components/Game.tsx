import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, GameObject, Particle, Dialogue, GameObjectType, Level } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboard } from '../hooks/useKeyboard';
import PlayerComponent from './Player';
import GameObjectComponent from './GameObject';
import DialogueBox from './DialogueBox';
import ParticleComponent from './Particle';
import InteractionPrompt from './InteractionPrompt';
// FIX: Import TILE_SIZE to be used in calculations.
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, PLAYER_SPEED, JUMP_STRENGTH, MAX_FALL_SPEED, PLAYER_FRICTION, PLAYER_WIDTH, PLAYER_HEIGHT, PUSH_FORCE, TILE_SIZE } from '../constants';
import audioService from '../services/audioService';
import { useLanguage } from '../context/LanguageContext';

interface GameProps {
    level: Level;
    gameState: GameState;
    onPause: () => void;
    onBookCollect: (bookId: number) => void;
    onLevelComplete: () => void;
    setCurrentDialogue: (dialogue: Dialogue | null) => void;
    collectedBooks: number[];
    currentDialogue?: Dialogue | null;
}

const Game: React.FC<GameProps> = ({ level, gameState, onBookCollect, onLevelComplete, setCurrentDialogue, collectedBooks, currentDialogue }) => {
    // FIX: Added missing properties to the playerRef initial value to match the Player type.
    const playerRef = useRef<Player>({
        x: level.playerStart.x,
        y: level.playerStart.y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        vx: 0,
        vy: 0,
        onGround: false,
        direction: 'right',
        hasKey: false,
        hp: 100,
        maxHp: 100,
        invulnerableTimer: 0,
        hasDoubleJump: false,
        jumpCount: 0,
        burstCooldown: 0,
        hasWeapon: false,
        ammo: 0,
        weaponCooldown: 0,
        // FIX: Add missing 'overchargeCooldown' property to satisfy the Player type.
        overchargeCooldown: 0,
    });
    
    const onGroundRef = useRef(playerRef.current.onGround);
    const [levelObjects, setLevelObjects] = useState<GameObject[]>(() => JSON.parse(JSON.stringify(level.objects)));
    const [particles, setParticles] = useState<Particle[]>([]);
    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const [screenShake, setScreenShake] = useState(0);
    const [nearbyObject, setNearbyObject] = useState<GameObject | null>(null);
    const [teleportCooldown, setTeleportCooldown] = useState(0);
    const [timedPuzzleTimer, setTimedPuzzleTimer] = useState(0);
    
    const lastScrapeSoundTime = useRef(0);
    const lastTimerSoundTime = useRef(0);

    const keyboard = useKeyboard();
    const { t } = useLanguage();

    const isColliding = (a: {x:number, y:number, width:number, height:number}, b: {x:number, y:number, width:number, height:number}, tolerance = 0) => {
        return a.x < b.x + b.width + tolerance &&
               a.x + a.width > b.x - tolerance &&
               a.y < b.y + b.height + tolerance &&
               a.y + a.height > b.y - tolerance;
    };

    const createParticles = useCallback((x: number, y: number, color: string, count = 15) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Math.random(),
                x,
                y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 8 + 4,
                color,
                life: 30,
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    const createLandingParticles = useCallback((x: number, y: number) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 5; i++) {
            newParticles.push({
                id: Math.random(),
                x,
                y,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * -2 - 1,
                size: Math.random() * 5 + 2,
                color: '#d1d5db',
                life: 20,
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    const triggerScreenShake = useCallback((intensity: number) => {
        setScreenShake(intensity);
        setTimeout(() => setScreenShake(0), 500);
    }, []);
    
    const gameTick = useCallback(() => {
        if (gameState !== GameState.Playing || currentDialogue) return;

        const player = playerRef.current;
        const wasOnGround = onGroundRef.current;
        let newObjects = JSON.parse(JSON.stringify(levelObjects));

        if (teleportCooldown > 0) setTeleportCooldown(prev => prev - 1);
        if (timedPuzzleTimer > 0) {
            setTimedPuzzleTimer(prev => prev - 1);
             if(Date.now() - lastTimerSoundTime.current > 250) {
                audioService.playTimerTick();
                lastTimerSoundTime.current = Date.now();
             }
        }

        // Update moving objects
        for (const obj of newObjects) {
            if (obj.type !== GameObjectType.PushableBlock) {
                 if (obj.moveSpeedX) {
                    obj.x += obj.moveSpeedX;
                    if (obj.x <= obj.moveMinX! || obj.x + obj.width >= obj.moveMaxX!) {
                        obj.moveSpeedX *= -1;
                    }
                }
                if (obj.moveSpeedY) {
                    obj.y += obj.moveSpeedY;
                    if (obj.y <= obj.moveMinY! || obj.y + obj.height >= obj.moveMaxY!) {
                        obj.moveSpeedY *= -1;
                    }
                }
            }
             if (obj.type === GameObjectType.FallingPlatform && obj.isFalling) {
                obj.vy = (obj.vy ?? 0) + GRAVITY;
                obj.y += obj.vy;
                if (obj.y > GAME_HEIGHT + 200) {
                     newObjects = newObjects.filter((o: GameObject) => o.id !== obj.id);
                }
            }
        }
        
        // Pushable Block Physics
        for (const obj of newObjects.filter((o: GameObject) => o.type === GameObjectType.PushableBlock)) {
            obj.onGround = false;
            obj.vy = (obj.vy ?? 0) + GRAVITY;
            if (obj.vy > MAX_FALL_SPEED) obj.vy = MAX_FALL_SPEED;
            obj.y += obj.vy;
            for (const platform of newObjects.filter((o: GameObject) => o.type === GameObjectType.Platform)) {
                if (isColliding(obj, platform)) {
                    const traps = newObjects.filter((o: GameObject) => o.type === GameObjectType.Trap);
                    for (const trap of traps) {
                        if (isColliding(obj, trap) && (obj.vy ?? 0) > 1) {
                            newObjects = newObjects.filter((o: GameObject) => o.id !== trap.id);
                            createParticles(trap.x + trap.width / 2, trap.y + trap.height / 2, '#ef4444', 30);
                            triggerScreenShake(8);
                            audioService.playImpact();
                        }
                    }
                    if ((obj.vy ?? 0) > 0) { obj.y = platform.y - obj.height; obj.onGround = true; obj.vy = 0; }
                    else if ((obj.vy ?? 0) < 0) { obj.y = platform.y + platform.height; obj.vy = 0; }
                }
            }
            obj.vx = (obj.vx ?? 0) * PLAYER_FRICTION;
            if (Math.abs(obj.vx) < 0.1) obj.vx = 0;
            obj.x += obj.vx;
            for (const platform of newObjects.filter((o: GameObject) => [GameObjectType.Platform, GameObjectType.Door].includes(o.type))) {
                if (isColliding(obj, platform)) {
                    if ((obj.vx ?? 0) > 0) obj.x = platform.x - obj.width;
                    else if ((obj.vx ?? 0) < 0) obj.x = platform.x + platform.width;
                    obj.vx = 0;
                }
            }
        }
        
        // Handle Triggers
        for (const obj of newObjects.filter((o: GameObject) => o.type === GameObjectType.PressurePlate)) {
            const isPlayerOn = isColliding({ ...player, y: player.y + player.height - 5, height: 10 }, obj);
            const isBlockOn = newObjects.some((block: GameObject) => block.type === GameObjectType.PushableBlock && isColliding(block, obj));
            const shouldBeTriggered = isPlayerOn || isBlockOn;

            if (obj.isTriggered !== shouldBeTriggered) {
                 obj.isTriggered = shouldBeTriggered;
                 if(shouldBeTriggered) audioService.playClick();
                 if (obj.isTimed && shouldBeTriggered) {
                    setTimedPuzzleTimer(300); // 5 seconds at 60fps
                 }
                 const target = newObjects.find((o: GameObject) => o.id === obj.targetId);
                 if (target && !target.isTimed) {
                    target.isTriggered = shouldBeTriggered;
                 }
            }
        }

        // Handle timed doors
        for (const obj of newObjects.filter((o: GameObject) => o.type === GameObjectType.Door && o.isTimed)) {
            const wasOpen = obj.isTriggered;
            obj.isTriggered = timedPuzzleTimer > 0;
            if (wasOpen && !obj.isTriggered && timedPuzzleTimer <= 0) {
                 setCurrentDialogue({ character: t.system, title: t.locked, text: t.timedPuzzleFail, onDialogueEnd: () => setCurrentDialogue(null) });
            }
        }

        // Player movement
        if (keyboard['arrowleft'] || keyboard['q']) { player.vx = -PLAYER_SPEED; player.direction = 'left'; }
        else if (keyboard['arrowright'] || keyboard['d']) { player.vx = PLAYER_SPEED; player.direction = 'right'; }
        else { player.vx *= PLAYER_FRICTION; if (Math.abs(player.vx) < 0.1) player.vx = 0; }
        player.x += player.vx;

        // Player X-axis collision
        for (const obj of newObjects) {
             if (([GameObjectType.Platform, GameObjectType.Door].includes(obj.type) && !obj.isTriggered) || obj.type === GameObjectType.PushableBlock) {
                 if (isColliding(player, obj)) {
                     if (obj.type === GameObjectType.PushableBlock) {
                         const pushDirection = player.vx > 0 ? 1 : -1;
                         obj.vx = (obj.vx ?? 0) + pushDirection * PUSH_FORCE;
                         if(player.onGround && Date.now() - lastScrapeSoundTime.current > 150) { audioService.playScrape(); lastScrapeSoundTime.current = Date.now(); }
                     }
                    if (player.vx > 0) player.x = obj.x - player.width;
                    else if (player.vx < 0) player.x = obj.x + obj.width;
                    player.vx = 0;
                 }
            }
        }

        // Gravity
        player.vy += GRAVITY;
        if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
        if ((keyboard['arrowup'] || keyboard['w'] || keyboard[' ']) && player.onGround) {
            player.vy = JUMP_STRENGTH;
            audioService.playJump();
            player.onGround = false;
            keyboard['arrowup'] = keyboard['w'] = keyboard[' '] = false;
        }

        const prevY = player.y;
        player.y += player.vy;
        player.onGround = false;
        
        // Player Y-axis collision
        for (const obj of newObjects.filter(o => [GameObjectType.Platform, GameObjectType.Door, GameObjectType.FallingPlatform, GameObjectType.PushableBlock].includes(o.type))) {
             if (obj.type === GameObjectType.Door && obj.isTriggered) continue;
            
            const playerBottom = player.y + player.height;
            const playerPrevBottom = prevY + player.height;

            if (isColliding(player, obj)) {
                if (player.vy >= 0 && playerPrevBottom <= obj.y) {
                    player.y = obj.y - player.height;
                    player.onGround = true;
                    player.vy = 0;
                    if (!wasOnGround) {
                        createLandingParticles(player.x + player.width / 2, player.y + player.height);
                        audioService.playLand();
                    }
                    if (obj.type === GameObjectType.FallingPlatform && !obj.isFalling && obj.shakeTime && !obj.fallDelay) {
                        obj.fallDelay = obj.shakeTime;
                    }
                } else if (player.vy < 0 && !obj.oneWay) {
                    player.y = obj.y + obj.height;
                    player.vy = 0;
                }
            }
        }
        onGroundRef.current = player.onGround;

        // Update falling platforms
        for (const obj of newObjects.filter(o => o.type === GameObjectType.FallingPlatform && o.fallDelay)) {
            if (obj.fallDelay > 0) obj.fallDelay--;
            if (obj.fallDelay === 0 && !obj.isFalling) {
                obj.isFalling = true;
                audioService.playPlatformCrumble();
            }
        }
        
        // Player interactions with objects
        let canInteractWith: GameObject | null = null;
        for (const obj of newObjects) {
            if (isColliding(player, obj, 10)) {
                switch(obj.type) {
                    case GameObjectType.Book:
                        if (!collectedBooks.includes(obj.id)) { onBookCollect(obj.id); audioService.playCollect(); }
                        break;
                    case GameObjectType.Trap:
                        createParticles(obj.x + obj.width / 2, obj.y + obj.height / 2, '#ef4444', 30);
                        newObjects = newObjects.filter((o: GameObject) => o.id !== obj.id);
                        player.x = level.playerStart.x; player.y = level.playerStart.y; player.vx = 0; player.vy = 0; audioService.playTrap(); triggerScreenShake(8);
                        break;
                    case GameObjectType.PatrollingTrap:
                         player.x = level.playerStart.x; player.y = level.playerStart.y; player.vx = 0; player.vy = 0; audioService.playTrap(); triggerScreenShake(5);
                        break;
                    case GameObjectType.Key:
                        if (!player.hasKey) { player.hasKey = true; newObjects = newObjects.filter(o => o.id !== obj.id); audioService.playCollect(); setCurrentDialogue({ character: t.system, title: t.itemFound, text: t.keyFound, onDialogueEnd: () => setCurrentDialogue(null) });}
                        break;
                    case GameObjectType.Door:
                        if (obj.isTriggered) { onLevelComplete(); audioService.playPuzzleComplete(); }
                        else if (obj.targetId) { /* controlled by plate */ }
                        else if (!player.hasKey) { canInteractWith = obj; }
                        else if (player.hasKey) { onLevelComplete(); audioService.playPuzzleComplete(); }
                        break;
                    case GameObjectType.Teleporter:
                        if (teleportCooldown === 0) {
                            const target = newObjects.find(o => o.id === obj.targetId);
                            if (target) { player.x = target.x; player.y = target.y - TILE_SIZE; setTeleportCooldown(60); audioService.playTeleport(); createParticles(target.x, target.y, '#a78bfa', 20); }
                        }
                        break;
                }
            }
        }
        setNearbyObject(canInteractWith);

        // Handle 'e' key interaction
        if (keyboard['e'] && nearbyObject) {
            if (nearbyObject.type === GameObjectType.Door && !nearbyObject.targetId && !player.hasKey) {
                setCurrentDialogue({ character: t.system, title: t.locked, text: t.lockedDoor, onDialogueEnd: () => setCurrentDialogue(null) });
            }
            keyboard['e'] = false;
        }

        if (player.y > GAME_HEIGHT + 100) {
            player.x = level.playerStart.x; player.y = level.playerStart.y; player.vx = 0; player.vy = 0; audioService.playTrap();
        }

        setLevelObjects(newObjects);
        setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1, vy: p.vy + 0.1 })).filter(p => p.life > 0));
        setCamera(prev => ({ x: prev.x + (player.x - GAME_WIDTH / 2 - prev.x) * 0.1, y: 0 }));
    }, [gameState, keyboard, createParticles, triggerScreenShake, currentDialogue, levelObjects, collectedBooks, onBookCollect, onLevelComplete, setCurrentDialogue, level.playerStart.x, level.playerStart.y, t, isColliding, createLandingParticles]);

    useGameLoop(gameTick);
    
    const shakeStyle = screenShake > 0 ? { transform: `translate(${Math.random() * screenShake - screenShake/2}px, ${Math.random() * screenShake - screenShake/2}px)` } : {};

    const backgroundStyle = {
        background: `linear-gradient(to bottom, ${level.backgroundLayers[0]}, ${level.backgroundLayers[1]})`
    };

    return (
        <div className="w-full h-full bg-gray-800 overflow-hidden relative" style={backgroundStyle}>
            <div className="absolute inset-0 transition-transform duration-100 ease-linear" style={{ transform: `translate(${-camera.x}px, ${-camera.y}px)`, ...shakeStyle }}>
                <PlayerComponent player={playerRef.current} />
                {levelObjects.map(obj => <GameObjectComponent key={obj.id} obj={obj} isCollected={collectedBooks.includes(obj.id) || (obj.type === GameObjectType.Key && playerRef.current.hasKey)} />)}
                {particles.map(p => <ParticleComponent key={p.id} particle={p} />)}
                {nearbyObject && !currentDialogue && <InteractionPrompt object={nearbyObject} />}
            </div>
            <div className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-lg shadow-lg">
                <h3 className="font-bold">{t.books}: {collectedBooks.length} / {level.objects.filter(o => o.type === GameObjectType.Book).length}</h3>
                {level.objects.some(o => o.type === GameObjectType.Key) && <h3 className="font-bold">{t.keyInventory}: {playerRef.current.hasKey ? '✔️' : '❌'}</h3>}
            </div>
            {currentDialogue && <DialogueBox dialogue={currentDialogue} />}
        </div>
    );
};

export default Game;