import { Level, GameObjectType } from '../types';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, BOOK_WIDTH, BOOK_HEIGHT } from '../constants';

export const level1: Level = {
    id: 1,
    playerStart: { x: TILE_SIZE * 2, y: TILE_SIZE * 16.5 },
    backgroundLayers: ['#1a202c', '#2d3748'],
    objects: [
        // --- World Bounds ---
        { id: 1, type: GameObjectType.Platform, x: 0, y: GAME_HEIGHT - TILE_SIZE, width: GAME_WIDTH, height: TILE_SIZE },
        { id: 8, type: GameObjectType.Platform, x: -TILE_SIZE, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 9, type: GameObjectType.Platform, x: GAME_WIDTH, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 10, type: GameObjectType.Platform, x: 0, y: -TILE_SIZE, width: GAME_WIDTH, height: TILE_SIZE },
        
        // --- AREA 1: The Introduction ---
        // A small first jump to learn controls
        { id: 1001, type: GameObjectType.Platform, x: TILE_SIZE * 4, y: GAME_HEIGHT - TILE_SIZE * 4, width: TILE_SIZE * 4, height: TILE_SIZE },
        // Book 1: Easy to get, teaches collection mechanic
        { id: 101, type: GameObjectType.Book, x: TILE_SIZE * 6, y: GAME_HEIGHT - TILE_SIZE * 5 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },

        // --- AREA 2: The Ascent ---
        // A series of staggered platforms leading upwards
        { id: 1002, type: GameObjectType.Platform, x: TILE_SIZE * 0, y: GAME_HEIGHT - TILE_SIZE * 7, width: TILE_SIZE * 3, height: TILE_SIZE },
        { id: 1003, type: GameObjectType.Platform, x: TILE_SIZE * 5, y: GAME_HEIGHT - TILE_SIZE * 10, width: TILE_SIZE * 5, height: TILE_SIZE },
        // Book 2: Placed along the main path
        { id: 102, type: GameObjectType.Book, x: TILE_SIZE * 1, y: GAME_HEIGHT - TILE_SIZE * 8 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },
        
        // A slightly hidden platform to encourage exploration
        { id: 1004, type: GameObjectType.Platform, x: TILE_SIZE * 0, y: GAME_HEIGHT - TILE_SIZE * 13, width: TILE_SIZE * 3, height: TILE_SIZE },
        // Book 3: Rewards the player for exploring
        { id: 103, type: GameObjectType.Book, x: TILE_SIZE * 1, y: GAME_HEIGHT - TILE_SIZE * 14 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },

        // --- AREA 3: The Upper Deck & Goal ---
        // A long platform across the top section of the level
        { id: 1005, type: GameObjectType.Platform, x: TILE_SIZE * 12, y: GAME_HEIGHT - TILE_SIZE * 12, width: TILE_SIZE * 13, height: TILE_SIZE },
        // The Key is the main objective of this area
        { id: 201, type: GameObjectType.Key, x: TILE_SIZE * 23, y: GAME_HEIGHT - TILE_SIZE * 13.5, width: TILE_SIZE, height: TILE_SIZE }, 
        // Book 4: A final collectible near the key
        { id: 104, type: GameObjectType.Book, x: TILE_SIZE * 14, y: GAME_HEIGHT - TILE_SIZE * 13 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },
        
        // --- AREA 4: The Exit ---
        // The door is visible but requires the key and dropping down from the upper deck
        { id: 202, type: GameObjectType.Door, x: TILE_SIZE * 22, y: GAME_HEIGHT - TILE_SIZE * 4, width: TILE_SIZE * 2, height: TILE_SIZE * 3 },
    ],
};

export const level2: Level = {
    id: 2,
    playerStart: { x: TILE_SIZE * 2, y: TILE_SIZE * 16 },
    backgroundLayers: ['#0f172a', '#1e293b'],
    objects: [
        // --- World Bounds ---
        { id: 2001, type: GameObjectType.Platform, x: 0, y: GAME_HEIGHT - TILE_SIZE, width: GAME_WIDTH, height: TILE_SIZE },
        { id: 2002, type: GameObjectType.Platform, x: -TILE_SIZE, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 2003, type: GameObjectType.Platform, x: GAME_WIDTH, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 2004, type: GameObjectType.Platform, x: 0, y: -TILE_SIZE, width: GAME_WIDTH, height: TILE_SIZE },
        
        // --- PUZZLE SETUP ---
        // Starting platform
        { id: 2101, type: GameObjectType.Platform, x: 0, y: TILE_SIZE * 18, width: TILE_SIZE * 8, height: TILE_SIZE },
        // The Pushable Block
        { id: 2501, type: GameObjectType.PushableBlock, x: TILE_SIZE * 5, y: TILE_SIZE * 16, width: TILE_SIZE * 1.5, height: TILE_SIZE * 1.5, vx: 0, vy: 0, onGround: false },
        
        // --- TRAP AREA ---
        // The ledge to push the block from
        { id: 2102, type: GameObjectType.Platform, x: TILE_SIZE * 10, y: TILE_SIZE * 18, width: TILE_SIZE * 5, height: TILE_SIZE },
        // The trap to be destroyed
        { id: 2301, type: GameObjectType.Trap, x: TILE_SIZE * 11.5, y: GAME_HEIGHT - TILE_SIZE * 2, width: TILE_SIZE, height: TILE_SIZE },
        // A wall forcing the player to deal with the trap
        { id: 2103, type: GameObjectType.Platform, x: TILE_SIZE * 15, y: TILE_SIZE * 15, width: TILE_SIZE, height: TILE_SIZE * 4 },
        
        // --- PRESSURE PLATE AREA ---
        // Path to the pressure plate
        { id: 2104, type: GameObjectType.Platform, x: TILE_SIZE * 15, y: TILE_SIZE * 15, width: TILE_SIZE * 10, height: TILE_SIZE },
        // The Pressure Plate - linked to the Door
        { id: 2201, type: GameObjectType.PressurePlate, x: TILE_SIZE * 20, y: TILE_SIZE * 14.5, width: TILE_SIZE * 3, height: TILE_SIZE / 2, targetId: 2402 },
        
        // --- EXIT ---
        // The Door
        { id: 2402, type: GameObjectType.Door, x: TILE_SIZE * 22, y: TILE_SIZE * 12, width: TILE_SIZE * 2, height: TILE_SIZE * 3 },
        
        // --- Collectibles ---
        // Book 1: On the starting platform
        { id: 201, type: GameObjectType.Book, x: TILE_SIZE * 1, y: TILE_SIZE * 17 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },
        // Book 2: Hidden under the ledge
        { id: 202, type: GameObjectType.Book, x: TILE_SIZE * 13, y: TILE_SIZE * 17 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },
        // Book 3: Near the exit door
        { id: 203, type: GameObjectType.Book, x: TILE_SIZE * 22.5, y: TILE_SIZE * 11 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },

        // Extra platforms for decoration/structure
        { id: 2105, type: GameObjectType.Platform, x: TILE_SIZE * 0, y: TILE_SIZE * 10, width: TILE_SIZE * 3, height: TILE_SIZE },
        { id: 2106, type: GameObjectType.Platform, x: TILE_SIZE * 5, y: TILE_SIZE * 5, width: TILE_SIZE * 3, height: TILE_SIZE },
    ],
};

export const level3: Level = {
    id: 3,
    playerStart: { x: TILE_SIZE * 2, y: TILE_SIZE * 2 },
    backgroundLayers: ['#0c0a09', '#171717'],
    objects: [
        // --- World Bounds ---
        { id: 3001, type: GameObjectType.Platform, x: 0, y: GAME_HEIGHT - TILE_SIZE, width: GAME_WIDTH, height: TILE_SIZE },
        { id: 3002, type: GameObjectType.Platform, x: -TILE_SIZE, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 3003, type: GameObjectType.Platform, x: GAME_WIDTH, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 3004, type: GameObjectType.Platform, x: 0, y: -TILE_SIZE, width: GAME_WIDTH, height: TILE_SIZE },

        // --- Section 1: Patrolling Trap ---
        { id: 3101, type: GameObjectType.Platform, x: 0, y: TILE_SIZE * 4, width: TILE_SIZE * 10, height: TILE_SIZE },
        { id: 3301, type: GameObjectType.Trap, x: TILE_SIZE * 6, y: TILE_SIZE * 4 - (TILE_SIZE / 2), width: TILE_SIZE, height: TILE_SIZE / 2 },
        { id: 301, type: GameObjectType.Book, x: TILE_SIZE * 1, y: TILE_SIZE * 3 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },
        
        // --- Section 2: Falling Platforms ---
        { id: 3102, type: GameObjectType.Platform, x: TILE_SIZE * 12, y: TILE_SIZE * 6, width: TILE_SIZE * 4, height: TILE_SIZE },
        { id: 3601, type: GameObjectType.FallingPlatform, x: TILE_SIZE * 17, y: TILE_SIZE * 6, width: TILE_SIZE * 2, height: TILE_SIZE, shakeTime: 45 },
        { id: 3602, type: GameObjectType.FallingPlatform, x: TILE_SIZE * 20, y: TILE_SIZE * 7, width: TILE_SIZE * 2, height: TILE_SIZE, shakeTime: 45 },
        { id: 3603, type: GameObjectType.FallingPlatform, x: TILE_SIZE * 17, y: TILE_SIZE * 8, width: TILE_SIZE * 2, height: TILE_SIZE, shakeTime: 45 },
        { id: 3103, type: GameObjectType.Platform, x: TILE_SIZE * 12, y: TILE_SIZE * 9, width: TILE_SIZE * 4, height: TILE_SIZE },
        
        // --- Section 3: Teleporter Puzzle ---
        { id: 3104, type: GameObjectType.Platform, x: 0, y: TILE_SIZE * 12, width: TILE_SIZE * 10, height: TILE_SIZE },
        { id: 3701, type: GameObjectType.Teleporter, x: TILE_SIZE * 8, y: TILE_SIZE * 11, width: TILE_SIZE, height: TILE_SIZE, targetId: 3702 },
        { id: 3105, type: GameObjectType.Platform, x: TILE_SIZE * 15, y: TILE_SIZE * 18, width: TILE_SIZE * 10, height: TILE_SIZE },
        { id: 3702, type: GameObjectType.Teleporter, x: TILE_SIZE * 16, y: TILE_SIZE * 17, width: TILE_SIZE, height: TILE_SIZE, targetId: 3701 },
        { id: 302, type: GameObjectType.Book, x: TILE_SIZE * 23, y: TILE_SIZE * 17 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },

        // --- Section 4: Physics Puzzle ---
        { id: 3201, type: GameObjectType.PressurePlate, x: TILE_SIZE * 2, y: TILE_SIZE * 11.5, width: TILE_SIZE * 2, height: TILE_SIZE/2, targetId: 3401 },
        { id: 3501, type: GameObjectType.PushableBlock, x: TILE_SIZE * 5, y: TILE_SIZE * 10, width: TILE_SIZE * 1.5, height: TILE_SIZE * 1.5, vx: 0, vy: 0, onGround: false },
        { id: 3302, type: GameObjectType.PatrollingTrap, x: TILE_SIZE * 3, y: TILE_SIZE * 15, width: TILE_SIZE, height: TILE_SIZE, moveSpeedY: 2, moveMinY: TILE_SIZE * 13, moveMaxY: TILE_SIZE * 18 },
        { id: 3303, type: GameObjectType.PatrollingTrap, x: TILE_SIZE * 6, y: TILE_SIZE * 18, width: TILE_SIZE, height: TILE_SIZE, moveSpeedY: -2, moveMinY: TILE_SIZE * 13, moveMaxY: TILE_SIZE * 18 },
        { id: 3401, type: GameObjectType.Door, x: TILE_SIZE * 10, y: TILE_SIZE * 15, width: TILE_SIZE, height: TILE_SIZE*4 },
        
        // --- Final Section ---
        { id: 3106, type: GameObjectType.Platform, x: TILE_SIZE * 11, y: TILE_SIZE * 15, width: TILE_SIZE * 3, height: TILE_SIZE },
        { id: 303, type: GameObjectType.Book, x: TILE_SIZE * 12, y: TILE_SIZE * 14 - BOOK_HEIGHT, width: BOOK_WIDTH, height: BOOK_HEIGHT },
        { id: 3901, type: GameObjectType.Door, x: TILE_SIZE * 22, y: TILE_SIZE * 16, width: TILE_SIZE * 2, height: TILE_SIZE * 3 },
    ],
};


export const level4: Level = {
    id: 4,
    playerStart: { x: TILE_SIZE * 2, y: GAME_HEIGHT - TILE_SIZE * 4 },
    backgroundLayers: ['#0d021a', '#1a0433'],
    objects: [
        // --- Level Bounds ---
        { id: 4001, type: GameObjectType.Platform, x: 0, y: GAME_HEIGHT, width: GAME_WIDTH * 2, height: TILE_SIZE },
        { id: 4002, type: GameObjectType.Platform, x: -TILE_SIZE, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 4003, type: GameObjectType.Platform, x: GAME_WIDTH * 2, y: 0, width: TILE_SIZE, height: GAME_HEIGHT },
        { id: 4004, type: GameObjectType.Platform, x: 0, y: -TILE_SIZE, width: GAME_WIDTH*2, height: TILE_SIZE },
        
        // --- Section 1: The Approach & Double Jump ---
        { id: 4101, type: GameObjectType.Platform, x: 0, y: GAME_HEIGHT - TILE_SIZE * 3, width: TILE_SIZE * 6, height: TILE_SIZE },
        { id: 4102, type: GameObjectType.Platform, x: TILE_SIZE * 9, y: GAME_HEIGHT - TILE_SIZE * 5, width: TILE_SIZE * 4, height: TILE_SIZE },
        { id: 4103, type: GameObjectType.Platform, x: TILE_SIZE * 15, y: GAME_HEIGHT - TILE_SIZE * 7, width: TILE_SIZE * 4, height: TILE_SIZE },
        { id: 4801, type: GameObjectType.DoubleJumpRune, x: TILE_SIZE * 16.5, y: GAME_HEIGHT - TILE_SIZE * 8.5, width: TILE_SIZE, height: TILE_SIZE },
        { id: 4104, type: GameObjectType.Platform, x: TILE_SIZE * 21, y: GAME_HEIGHT - TILE_SIZE * 10, width: TILE_SIZE * 3, height: TILE_SIZE },

        // --- Section 2: Hidden Platforms ---
        { id: 4105, type: GameObjectType.Platform, x: TILE_SIZE * 28, y: GAME_HEIGHT - TILE_SIZE * 9, width: TILE_SIZE * 3, height: TILE_SIZE },
        { id: 4901, type: GameObjectType.HiddenPlatform, x: TILE_SIZE * 33, y: GAME_HEIGHT - TILE_SIZE * 11, width: TILE_SIZE * 3, height: TILE_SIZE, isHidden: true },
        { id: 4902, type: GameObjectType.HiddenPlatform, x: TILE_SIZE * 38, y: GAME_HEIGHT - TILE_SIZE * 13, width: TILE_SIZE * 3, height: TILE_SIZE, isHidden: true },
        
        // --- Section 3: Checkpoint & Pre-Boss Area ---
        { id: 4106, type: GameObjectType.Platform, x: TILE_SIZE * 43, y: GAME_HEIGHT - TILE_SIZE * 15, width: TILE_SIZE * 5, height: TILE_SIZE },
        { id: 4802, type: GameObjectType.Checkpoint, x: TILE_SIZE * 45, y: GAME_HEIGHT - TILE_SIZE * 16, width: TILE_SIZE * 1, height: TILE_SIZE },
        { id: 4803, type: GameObjectType.PlayerWeaponPickup, x: TILE_SIZE * 45, y: GAME_HEIGHT - TILE_SIZE * 17, width: TILE_SIZE * 2, height: TILE_SIZE },
        
        // --- BOSS ARENA ---
        { id: 4108, type: GameObjectType.Platform, x: TILE_SIZE * 52, y: GAME_HEIGHT - TILE_SIZE * 3, width: GAME_WIDTH, height: TILE_SIZE * 3 }, // Floor
        // Floating platforms in arena
        { id: 4109, type: GameObjectType.Platform, x: TILE_SIZE * 58, y: GAME_HEIGHT - TILE_SIZE * 8, width: TILE_SIZE * 4, height: TILE_SIZE },
        { id: 4110, type: GameObjectType.Platform, x: TILE_SIZE * 68, y: GAME_HEIGHT - TILE_SIZE * 11, width: TILE_SIZE * 4, height: TILE_SIZE },
        { id: 4111, type: GameObjectType.Platform, x: TILE_SIZE * 78, y: GAME_HEIGHT - TILE_SIZE * 8, width: TILE_SIZE * 4, height: TILE_SIZE },
        
        // --- Boss Arena Objects ---
        // Guardian Placeholder (will be spawned by logic)
        // Truth Crystals
        { id: 4811, type: GameObjectType.TruthCrystal, x: TILE_SIZE * 53, y: GAME_HEIGHT - TILE_SIZE * 6, width: TILE_SIZE, height: TILE_SIZE },
        { id: 4812, type: GameObjectType.TruthCrystal, x: TILE_SIZE * 69.5, y: GAME_HEIGHT - TILE_SIZE * 14, width: TILE_SIZE, height: TILE_SIZE },
        { id: 4813, type: GameObjectType.TruthCrystal, x: TILE_SIZE * 85, y: GAME_HEIGHT - TILE_SIZE * 6, width: TILE_SIZE, height: TILE_SIZE },
        
        // Final Spellbook
        { id: 4999, type: GameObjectType.FinalBook, x: TILE_SIZE * 69.5, y: GAME_HEIGHT - TILE_SIZE * 5, width: TILE_SIZE, height: TILE_SIZE },
    ],
};