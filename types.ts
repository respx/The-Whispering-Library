

export enum GameState {
    StartMenu,
    Playing,
    Paused,
    LevelComplete,
    Dialogue,
    FinalBattle,
    Ending,
}

export interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    onGround: boolean;
    direction: 'left' | 'right';
    hasKey: boolean;
    // Final level properties
    hp: number;
    maxHp: number;
    invulnerableTimer: number;
    hasDoubleJump: boolean;
    jumpCount: number;
    burstCooldown: number;
    hasWeapon: boolean;
    ammo: number;
    weaponCooldown: number;
    overchargeCooldown: number;
}

export enum GameObjectType {
    Platform,
    Book,
    Trap,
    Key,
    Door,
    PushableBlock,
    PressurePlate,
    FallingPlatform,
    Teleporter,
    PatrollingTrap,
    FinalBook,
    // Final Level Types
    DoubleJumpRune,
    TruthCrystal,
    Checkpoint,
    HiddenPlatform,
    Guardian,
    GuardianAttack,
    PlayerWeaponPickup,
    PlayerProjectile,
}

export interface GameObject {
    id: number;
    type: GameObjectType;
    x: number;
    y: number;
    width: number;
    height: number;
    // For pressure plates & triggers
    isTriggered?: boolean;
    targetId?: number;
    isTimed?: boolean;
    // For moving platforms/traps
    moveSpeedX?: number;
    moveSpeedY?: number;
    moveMinX?: number;
    moveMaxX?: number;
    moveMinY?: number;
    moveMaxY?: number;
    // For one-way platforms
    oneWay?: boolean;
    // For physics on non-player objects
    vx?: number;
    vy?: number;
    onGround?: boolean;
    // For falling platforms
    isFalling?: boolean;
    fallDelay?: number;
    shakeTime?: number;
    // For teleporters
    targetX?: number;
    targetY?: number;
    // For Guardian Attacks
    attackType?: 'orb' | 'rune' | 'wave' | 'beam' | 'bolt';
    life?: number;
    // For Hidden Platforms
    isHidden?: boolean;
    revealTimer?: number;
    // For special player projectile
    isOvercharged?: boolean;
}

export interface Level {
    id: number;
    playerStart: { x: number; y: number };
    objects: GameObject[];
    backgroundLayers: string[];
}

export interface Dialogue {
    character: string;
    title: string;
    text: string;
    onDialogueEnd: () => void;
    isGuardian?: boolean;
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
}

export interface StoryFragment {
    id: number;
    text: string;
}