
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, GameObject, Particle, Dialogue, GameObjectType, Level } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboard } from '../hooks/useKeyboard';
import PlayerComponent from './Player';
import GameObjectComponent from './GameObject';
import DialogueBox from './DialogueBox';
import ParticleComponent from './Particle';
import InteractionPrompt from './InteractionPrompt';
import PlayerUI from './ui/PlayerUI';
import FinalBattleIntro from './ui/FinalBattleIntro';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, PLAYER_SPEED, JUMP_STRENGTH, MAX_FALL_SPEED, PLAYER_FRICTION, PLAYER_WIDTH, PLAYER_HEIGHT, TILE_SIZE } from '../constants';
import audioService from '../services/audioService';
import { useLanguage } from '../context/LanguageContext';
import { GuardianAI, AIAction } from '../game/guardianAI';

interface GameProps {
    level: Level;
    gameState: GameState;
    onPause: () => void;
    onLevelComplete: () => void;
    applyVirusCheat?: boolean;
}

type GuardianState = 'intro' | 'awakening' | 'phase1' | 'phase2' | 'phase3' | 'vulnerable' | 'defeated' | 'teleporting';
type CutscenePhase = 'none' | 'guardian_awakening' | 'phase_transition' | 'final_blow' | 'structure_collapse' | 'mysterious_glow' | 'chapter_end';
type GuardianAttackType = 'orb' | 'rune' | 'beam';

const FinalLevel: React.FC<GameProps> = ({ level, gameState, onLevelComplete, applyVirusCheat }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [playerStart, setPlayerStart] = useState(level.playerStart);
    const playerRef = useRef<Player>({
        x: playerStart.x, y: playerStart.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
        vx: 0, vy: 0, onGround: false, direction: 'right', hasKey: false, hp: 100, maxHp: 100,
        invulnerableTimer: 0, hasDoubleJump: false, jumpCount: 0,
        burstCooldown: 0,
        hasWeapon: false, ammo: 0, weaponCooldown: 0, overchargeCooldown: 0,
    });
    
    const [levelObjects, setLevelObjects] = useState<GameObject[]>(() => {
        const initialObjects = JSON.parse(JSON.stringify(level.objects));
        const finalBook = initialObjects.find((o: GameObject) => o.type === GameObjectType.FinalBook);
        if (finalBook) {
            finalBook.isHidden = true;
        }
        return initialObjects;
    });
    const crystalTemplates = useRef(level.objects.filter(o => o.type === GameObjectType.TruthCrystal));
    const [particles, setParticles] = useState<Particle[]>([]);
    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const [screenShake, setScreenShake] = useState(0);
    const [nearbyObject, setNearbyObject] = useState<GameObject | null>(null);
    const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
    const [collectedCrystals, setCollectedCrystals] = useState(0);
    const [showIntro, setShowIntro] = useState(true);
    const mousePos = useRef({ x: 0, y: 0 });

    const [guardian, setGuardian] = useState<GameObject | null>(null);
    const [guardianState, setGuardianState] = useState<GuardianState>('intro');
    const [guardianAttacks, setGuardianAttacks] = useState<GameObject[]>([]);
    const [playerProjectiles, setPlayerProjectiles] = useState<GameObject[]>([]);
    const [guardianHp, setGuardianHp] = useState(300);
    const [guardianMaxHp] = useState(300);
    
    const guardianAI = useRef(new GuardianAI());
    
    const isDoubleJumping = useRef(false);
    const phaseTransitionDone = useRef({ phase2: false, phase3: false });

    const keyboard = useKeyboard();
    const { t } = useLanguage();
    const dialogueQueue = useRef<Dialogue[]>([]).current;
    
    useEffect(() => {
        setTimeout(() => setShowIntro(false), 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (applyVirusCheat && guardian) {
            setGuardianHp(5);
            // We don't need to reset the prop, App state will handle it on game restart/exit
        }
    }, [applyVirusCheat, guardian]);

    const fireProjectile = useCallback((isOvercharged = false) => {
        const player = playerRef.current;
        const barrelOffset = 20;
        const weaponPivotX = player.x + player.width / 2;
        const weaponPivotY = player.y + player.height / 2;
        const mouseGameX = mousePos.current.x + camera.x;
        const mouseGameY = mousePos.current.y + camera.y;
        
        const angleRad = Math.atan2(mouseGameY - weaponPivotY, mouseGameX - weaponPivotX);
        
        const startX = weaponPivotX + Math.cos(angleRad) * barrelOffset;
        const startY = weaponPivotY + Math.sin(angleRad) * barrelOffset;

        if (isOvercharged) {
            const projectileSpeed = 18;
            setPlayerProjectiles(prev => [...prev, {
                id: Math.random(), type: GameObjectType.PlayerProjectile,
                x: startX - 25, y: startY - 25,
                width: 50, height: 50,
                vx: Math.cos(angleRad) * projectileSpeed,
                vy: Math.sin(angleRad) * projectileSpeed,
                isOvercharged: true,
            }]);
            audioService.playGuardianPhaseChange();
        } else {
            const projectileSpeed = 25;
            setPlayerProjectiles(prev => [...prev, {
                id: Math.random(), type: GameObjectType.PlayerProjectile,
                x: startX - 20, y: startY - 4,
                width: 40, height: 8,
                vx: Math.cos(angleRad) * projectileSpeed,
                vy: Math.sin(angleRad) * projectileSpeed,
            }]);
            audioService.playMagicBurst();
        }
        createParticles(startX, startY, isOvercharged ? '#fef08a' : '#d8b4fe', isOvercharged ? 20 : 5, isOvercharged ? 8 : 2);

    }, [camera.x, camera.y]);

    const fireWeapon = useCallback(() => {
        const player = playerRef.current;
        if (!player.hasWeapon || player.weaponCooldown > 0) return;
        player.weaponCooldown = 15;
        fireProjectile(false);
    }, [fireProjectile]);
    
    const fireOvercharge = useCallback(() => {
        const player = playerRef.current;
        if (!player.hasWeapon || player.overchargeCooldown > 0) return;
        player.overchargeCooldown = 1800; // 30 seconds * 60 fps
        fireProjectile(true);
    }, [fireProjectile]);


    useEffect(() => {
        const container = gameContainerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) { // Left mouse button
                fireWeapon();
            }
        };
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('contextmenu', handleContextMenu);
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [fireWeapon]);


    const processNextDialogue = useCallback(() => {
        if (dialogueQueue.length > 0) {
            setCurrentDialogue(dialogueQueue.shift()!);
        } else {
            setCurrentDialogue(null);
        }
    }, [dialogueQueue]);

    const createParticles = useCallback((x: number, y: number, color: string, count = 15, power = 8) => {
        const newParticles: Particle[] = Array.from({ length: count }, () => ({
            id: Math.random(), x, y,
            vx: (Math.random() - 0.5) * power, vy: (Math.random() - 0.5) * power,
            size: Math.random() * 8 + 4, color, life: 30,
        }));
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    const triggerScreenShake = useCallback((intensity: number) => { 
        setScreenShake(intensity); 
        setTimeout(() => setScreenShake(0), 500); 
    }, []);

    const playerTakeDamage = (amount: number) => {
        const player = playerRef.current;
        if (player.invulnerableTimer > 0) return;
        player.hp -= amount;
        player.invulnerableTimer = 90;
        triggerScreenShake(8);
        audioService.playImpact();
        if (player.hp <= 0) {
            player.hp = player.maxHp;
            player.x = playerStart.x;
            player.y = playerStart.y;
            player.vx = 0; player.vy = 0;
        }
    }

    const isColliding = (a: {x:number, y:number, width:number, height:number}, b: {x:number, y:number, width:number, height:number}, tolerance = 0) => {
        return a.x < b.x + b.width + tolerance && a.x + a.width > b.x - tolerance && a.y < b.y + b.height + tolerance && a.y + a.height > b.y - tolerance;
    };

    const guardianTakeDamage = useCallback((amount: number, projectile: GameObject) => {
        const impactPoint = {
            x: projectile.x + projectile.width / 2,
            y: projectile.y + projectile.height / 2,
        };

        if (projectile.isOvercharged) {
            setGuardianHp(prev => Math.max(0, prev - 70));
            triggerScreenShake(20);
            createParticles(impactPoint.x, impactPoint.y, '#facc15', 60, 15);
            audioService.playImpact();
            audioService.playGuardianPhaseChange();
            return;
        }

        if (guardianState === 'vulnerable' && guardian) {
            setGuardianHp(prev => Math.max(0, prev - amount));
            triggerScreenShake(12);
            createParticles(impactPoint.x, impactPoint.y, '#f97316', 40, 12); // Big orange impact
            audioService.playImpact();
        } else if (guardian) {
            setGuardianHp(prev => Math.max(0, prev - 1)); // Chip damage
            audioService.playShieldHit();
            createParticles(impactPoint.x, impactPoint.y, '#a855f7', 10, 4); // Small purple shield hit
        }
    }, [guardianState, guardian, createParticles, triggerScreenShake]);
    
    
    const gameTick = useCallback(() => {
        if (gameState !== GameState.FinalBattle || currentDialogue ) return;

        const player = playerRef.current;
        let newObjects = [...levelObjects];
        
        // Update timers
        if (player.invulnerableTimer > 0) player.invulnerableTimer--;
        if (player.weaponCooldown > 0) player.weaponCooldown--;
        if (player.burstCooldown > 0) player.burstCooldown--;
        if (player.overchargeCooldown > 0) player.overchargeCooldown--;

        isDoubleJumping.current = false;

        // ABILITY ACTIVATION
        if (keyboard['f'] && player.burstCooldown === 0) {
            player.burstCooldown = 480; // 8 seconds
            audioService.playMagicBurst();
            createParticles(player.x + player.width/2, player.y + player.height/2, '#a78bfa', 25, 5);
            newObjects.forEach(obj => {
                if (obj.type === GameObjectType.HiddenPlatform) {
                    obj.isHidden = false;
                    obj.revealTimer = 180; // 3 seconds
                }
            });
            keyboard['f'] = false;
        }

        if (keyboard['x']) {
            fireOvercharge();
            keyboard['x'] = false;
        }
        
        // Update hidden platform timers
        newObjects.forEach(obj => {
            if (obj.type === GameObjectType.HiddenPlatform && obj.revealTimer && obj.revealTimer > 0) {
                obj.revealTimer--;
                if (obj.revealTimer <= 0) {
                    obj.isHidden = true;
                }
            }
        });
        
        // Player movement
        if (keyboard['arrowleft'] || keyboard['q']) { player.vx = -PLAYER_SPEED; player.direction = 'left'; }
        else if (keyboard['arrowright'] || keyboard['d']) { player.vx = PLAYER_SPEED; player.direction = 'right'; }
        else { player.vx *= PLAYER_FRICTION; if (Math.abs(player.vx) < 0.1) player.vx = 0; }
        player.x += player.vx;
        for (const obj of newObjects) {
             if (obj.type === GameObjectType.Platform && isColliding(player, obj)) {
                 if (player.vx > 0) player.x = obj.x - player.width; else if (player.vx < 0) player.x = obj.x + obj.width;
                 player.vx = 0;
            }
        }
        player.vy += GRAVITY;
        if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
        if ((keyboard['arrowup'] || keyboard['w'] || keyboard[' '])) {
            if (player.onGround) { player.vy = JUMP_STRENGTH; audioService.playJump(); player.jumpCount = 1; player.onGround = false; }
            else if (player.hasDoubleJump && player.jumpCount < 2) {
                player.vy = JUMP_STRENGTH * 0.9; audioService.playDoubleJump(); player.jumpCount = 2; isDoubleJumping.current = true;
                createParticles(player.x + player.width/2, player.y + player.height, '#a3e635', 15, 8);
            }
            keyboard['arrowup'] = keyboard['w'] = keyboard[' '] = false;
        }
        const prevY = player.y;
        player.y += player.vy;
        player.onGround = false;
        for (const obj of newObjects.filter(o => o.type === GameObjectType.Platform || (o.type === GameObjectType.HiddenPlatform && !o.isHidden))) {
            const playerBottom = player.y + player.height, playerPrevBottom = prevY + player.height;
            const isHorizontallyAligned = player.x + player.width > obj.x && player.x < obj.x + obj.width;
            if (player.vy >= 0 && isHorizontallyAligned && playerPrevBottom <= obj.y && playerBottom >= obj.y) {
                player.y = obj.y - player.height; player.onGround = true; player.vy = 0; player.jumpCount = 0;
            } else if (player.vy < 0 && isHorizontallyAligned && prevY >= obj.y + obj.height && player.y <= obj.y + obj.height) {
                 player.y = obj.y + obj.height; player.vy = 0;
            }
        }
        
        // INTERACTIONS
        let foundObject: GameObject | null = null;
        for (const obj of newObjects) {
            if (isColliding(player, obj, 10)) {
                if ([GameObjectType.DoubleJumpRune, GameObjectType.Checkpoint, GameObjectType.PlayerWeaponPickup].includes(obj.type)) foundObject = obj;
                if (obj.type === GameObjectType.DoubleJumpRune && !player.hasDoubleJump) {
                    player.hasDoubleJump = true; newObjects = newObjects.filter(o => o.id !== obj.id); createParticles(obj.x, obj.y, '#a3e635', 30);
                }
                if (obj.type === GameObjectType.Checkpoint) {
                    setPlayerStart({x: obj.x, y: obj.y - player.height });
                    newObjects = newObjects.filter(o => o.id !== obj.id);
                }
                if (obj.type === GameObjectType.FinalBook && !obj.isHidden) {
                    onLevelComplete();
                    obj.isHidden = true; // Prevent multiple triggers
                }
            }
        }
        setNearbyObject(foundObject);
        if (keyboard['e'] && nearbyObject?.type === GameObjectType.PlayerWeaponPickup && !player.hasWeapon) {
            player.hasWeapon = true; newObjects = newObjects.filter(o => o.id !== nearbyObject.id);
        }

        // BOSS LOGIC
        if (player.x > TILE_SIZE * 50 && guardianState === 'intro') {
            setGuardianState('awakening');
            setGuardian({ id: 9999, type: GameObjectType.Guardian, x: TILE_SIZE * 68, y: TILE_SIZE * 5, width: TILE_SIZE * 4, height: TILE_SIZE * 4 });
            setGuardianState('phase1');
            audioService.playMusic(3, 'phase1');
        }

        // Phase transitions
        if (guardian && guardianHp <= guardianMaxHp * 0.66 && !phaseTransitionDone.current.phase2 && guardianState === 'phase1') {
            phaseTransitionDone.current.phase2 = true; setGuardianState('phase2'); audioService.playMusic(3, 'phase2');
        }
        if (guardian && guardianHp <= guardianMaxHp * 0.33 && !phaseTransitionDone.current.phase3 && guardianState === 'phase2') {
            phaseTransitionDone.current.phase3 = true; setGuardianState('phase3'); audioService.playMusic(3, 'phase3');
        }
        
        // Guardian Death Cinematic
        if (guardian && guardianHp <= 0 && guardianState !== 'defeated') {
            setGuardianState('defeated');
            audioService.stopMusic();
            audioService.playGuardianPhaseChange();
            triggerScreenShake(25);
    
            setTimeout(() => {
                audioService.playGuardianRumble();
                triggerScreenShake(15);
            }, 1500);
    
            setTimeout(() => {
                if (guardian) {
                    createParticles(guardian.x + guardian.width / 2, guardian.y + guardian.height / 2, '#ffffff', 100, 20);
                }
                setGuardian(null);
                audioService.playVictoryMelody();
    
                setLevelObjects(prev => {
                    const nextObjects = [...prev];
                    const finalBook = nextObjects.find(o => o.type === GameObjectType.FinalBook);
                    if (finalBook) {
                        finalBook.isHidden = false;
                        createParticles(finalBook.x + finalBook.width / 2, finalBook.y + finalBook.height / 2, '#22d3ee', 50, 8);
                    }
                    return nextObjects;
                });
                
                const dialogue1: Dialogue = {
                    character: t.guardian, title: t.guardian, isGuardian: true, text: t.guardianDefeated1,
                    onDialogueEnd: () => setCurrentDialogue(dialogue2)
                };
                const dialogue2: Dialogue = {
                    character: t.lumin, title: t.lumin, text: t.guardianDefeated2,
                    onDialogueEnd: () => setCurrentDialogue(dialogue3)
                };
                const dialogue3: Dialogue = {
                    character: t.system, title: t.system, text: t.foundSpellbook,
                    onDialogueEnd: () => {
                        setCurrentDialogue(null);
                        onLevelComplete();
                    }
                };
                setCurrentDialogue(dialogue1);
    
            }, 3000);
        }

        // AI LOGIC
        if (guardian && ['phase1', 'phase2', 'phase3', 'vulnerable'].includes(guardianState)) {
             const actions: AIAction[] = guardianAI.current.update(guardianState as any, guardian, player);

             for (const action of actions) {
                 switch (action.type) {
                    case 'MOVE':
                        guardian.x += (action.payload.x - guardian.x) * 0.1;
                        guardian.y += (action.payload.y - guardian.y) * 0.1;
                        break;
                     case 'SPAWN_ATTACKS':
                         audioService.playGuardianShoot();
                         setGuardianAttacks(prev => [...prev, ...action.payload]);
                         break;
                 }
             }
        }
        
        // Update projectiles
        // Guardian Attacks
        let updatedAttacks = guardianAttacks.map(a => {
            return { ...a, x: a.x + (a.vx ?? 0), y: a.y + (a.vy ?? 0) };
        }).filter(a => a.y < GAME_HEIGHT + 50 && a.x > TILE_SIZE * 50 && a.x < TILE_SIZE * 52 + GAME_WIDTH + 50);

        const attacksToRemove = new Set<number>();
        for (const attack of updatedAttacks) {
            if (isColliding(player, attack)) {
                playerTakeDamage(20); // Increased damage
                attacksToRemove.add(attack.id);
                createParticles(attack.x, attack.y, '#ef4444', 20, 8);
            }
        }
        setGuardianAttacks(updatedAttacks.filter(a => !attacksToRemove.has(a.id)));

        // Player Projectiles
        let updatedProjectiles = playerProjectiles.map(p => ({
            ...p, x: p.x + (p.vx ?? 0), y: p.y + (p.vy ?? 0)
        })).filter(p => p.x > -50 && p.x < GAME_WIDTH * 2 + 50 && p.y > -50 && p.y < GAME_HEIGHT + 50);
        
        const projectilesToRemove = new Set<number>();
        const crystals = newObjects.filter(o => o.type === GameObjectType.TruthCrystal);
        for(const proj of updatedProjectiles) {
            if (guardian && isColliding(proj, guardian)) {
                guardianTakeDamage(10, proj);
                projectilesToRemove.add(proj.id);
            }
            for (const crystal of crystals) {
                if (isColliding(proj, crystal)) {
                    newObjects = newObjects.filter(o => o.id !== crystal.id);
                    projectilesToRemove.add(proj.id);
                    setCollectedCrystals(c => c + 1);
                    audioService.playCrystalCollect();
                    triggerScreenShake(10);
                    createParticles(crystal.x, crystal.y, '#22d3ee', 40, 10);
                }
            }
        }
        setPlayerProjectiles(updatedProjectiles.filter(p => !projectilesToRemove.has(p.id)));

        if (crystals.length === 0 && guardianState !== 'vulnerable' && guardianHp > 0) {
            setGuardianState('vulnerable');
        }
         if (guardianState === 'vulnerable' && crystals.length > 0) { // Failsafe if crystals respawn
            const currentPhase = guardianHp <= guardianMaxHp * 0.33 ? 'phase3' : guardianHp <= guardianMaxHp * 0.66 ? 'phase2' : 'phase1';
            setGuardianState(currentPhase);
        }
        
        if (player.y > GAME_HEIGHT + 100) { playerTakeDamage(100); }
        setLevelObjects(newObjects);
        setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1, vy: p.vy + 0.1, })).filter(p => p.life > 0));

        // Camera logic
        const targetX = player.x - GAME_WIDTH / 2;
        // The level is twice the width of the game screen
        const levelWidth = GAME_WIDTH * 2;
        const maxX = levelWidth - GAME_WIDTH;
        const clampedX = Math.max(0, Math.min(targetX, maxX));
        
        setCamera(prev => ({ x: prev.x + (clampedX - prev.x) * 0.1, y: 0 }));

    }, [gameState, keyboard, createParticles, triggerScreenShake, currentDialogue, levelObjects, t, dialogueQueue, processNextDialogue, playerStart, guardian, guardianState, collectedCrystals, guardianAttacks, playerProjectiles, guardianHp, guardianMaxHp, guardianTakeDamage, fireWeapon, fireOvercharge, applyVirusCheat, onLevelComplete]);

    useGameLoop(gameTick);
    
    const shakeStyle = screenShake > 0 ? { transform: `translate(${Math.random() * screenShake - screenShake/2}px, ${Math.random() * screenShake - screenShake/2}px)` } : {};

    return (
        <div ref={gameContainerRef} className={`w-full h-full bg-gray-800 overflow-hidden relative ${screenShake > 5 ? 'shake-hard' : ''}`}>
            {/* Background and cinematic effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0433] to-[#0d021a] transition-all duration-1000" style={{ filter: guardianState === 'phase3' ? 'hue-rotate(45deg) brightness(0.7)' : guardianState === 'phase2' ? 'hue-rotate(20deg) brightness(0.85)' : 'none' }}></div>
            <div className="absolute inset-0 bg-repeat bg-center opacity-10" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/stardust.png)', animation: `background-vortex ${guardianState === 'phase3' ? '60s' : '120s'} linear infinite`}}></div>

            <div className="absolute inset-0 transition-transform duration-100 ease-linear" style={{ transform: `translate(${-camera.x}px, ${-camera.y}px)`, ...shakeStyle, transformOrigin: 'center center' }}>
                <PlayerComponent 
                    player={playerRef.current} 
                    isDoubleJumping={isDoubleJumping.current} 
                    mousePos={mousePos.current}
                    camera={camera}
                />
                {levelObjects.map(obj => <GameObjectComponent key={obj.id} obj={obj} isCollected={
                    (obj.type === GameObjectType.DoubleJumpRune && playerRef.current.hasDoubleJump) ||
                    (obj.type === GameObjectType.PlayerWeaponPickup && playerRef.current.hasWeapon)
                }/> )}
                {guardian && <GameObjectComponent obj={guardian} player={playerRef.current} isDefeated={guardianState === 'defeated'} />}
                {guardianAttacks.map(a => <GameObjectComponent key={a.id} obj={a} /> )}
                {playerProjectiles.map(p => <GameObjectComponent key={p.id} obj={p} />)}
                {particles.map(p => <ParticleComponent key={p.id} particle={p} />)}
                {nearbyObject && !currentDialogue && <InteractionPrompt object={nearbyObject} />}
            </div>

            <PlayerUI player={playerRef.current} />
            <div className="absolute top-20 right-8 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-cyan-400 z-30">
                <div className="flex items-center gap-3">
                    <span className="text-cyan-400 text-2xl">💎</span>
                    <span className="text-white font-bold text-xl">{collectedCrystals} / 3</span>
                </div>
            </div>

            {guardian && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-8 py-4 rounded-xl border-2 border-red-500 z-30 min-w-[300px]">
                    <div className="text-center mb-2 font-bold text-red-400">
                        {guardianState === 'phase3' ? t.guardianTitlePhase3 : 
                         guardianState === 'phase2' ? t.guardianTitlePhase2 : 
                         guardianState === 'vulnerable' ? t.guardianTitleVulnerable : t.guardianTitleDefault}
                    </div>
                    <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden border border-red-500">
                        <div className={`h-full transition-all duration-300 ${ guardianState === 'vulnerable' ? 'bg-gradient-to-r from-green-500 to-green-300 animate-pulse' : guardianHp < guardianMaxHp * 0.3 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`} style={{ width: `${(guardianHp / guardianMaxHp) * 100}%` }}></div>
                    </div>
                    <div className="text-center mt-1 text-sm text-gray-300">{guardianHp} / {guardianMaxHp}</div>
                </div>
            )}

            {showIntro && <FinalBattleIntro />}
            {currentDialogue && <DialogueBox dialogue={currentDialogue} />}
        </div>
    );
};

export default FinalLevel;