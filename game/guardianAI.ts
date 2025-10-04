import { Player, GameObject, GameObjectType } from '../types';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../constants';

type GuardianState = 'phase1' | 'phase2' | 'phase3' | 'vulnerable';
type AIState = 'ATTACKING' | 'REPOSITIONING';

const ARENA_BOUNDS = { x: TILE_SIZE * 52, y: 0, width: GAME_WIDTH, height: GAME_HEIGHT };
const REPOSITION_POINTS = [
    { x: ARENA_BOUNDS.x + TILE_SIZE * 8, y: TILE_SIZE * 6 },
    { x: ARENA_BOUNDS.x + TILE_SIZE * 18, y: TILE_SIZE * 5 },
    { x: ARENA_BOUNDS.x + TILE_SIZE * 28, y: TILE_SIZE * 6 },
];

export interface AIAction {
    type: 'MOVE' | 'SPAWN_ATTACKS';
    payload: any;
}

export class GuardianAI {
    private attackCooldown: number;
    private attackIdCounter: number;
    private aiState: AIState;
    private stateTimer: number;
    private targetPosition: { x: number; y: number };

    constructor() {
        this.attackCooldown = 0;
        this.attackIdCounter = 1000;
        this.aiState = 'ATTACKING';
        this.stateTimer = 480; // 8 seconds of attacking
        this.targetPosition = { ...REPOSITION_POINTS[1] };
    }

    public update(guardianState: GuardianState, guardian: GameObject, player: Player): AIAction[] {
        const actions: AIAction[] = [];
        
        this.stateTimer--;

        // State Transitions
        if (this.stateTimer <= 0) {
            if (this.aiState === 'ATTACKING') {
                this.aiState = 'REPOSITIONING';
                this.stateTimer = 90; // 1.5 seconds to reposition
                // Pick a new random reposition point that's not the current one
                const currentPointIndex = REPOSITION_POINTS.findIndex(p => p.x === this.targetPosition.x);
                let nextPointIndex = Math.floor(Math.random() * REPOSITION_POINTS.length);
                while(nextPointIndex === currentPointIndex) {
                    nextPointIndex = Math.floor(Math.random() * REPOSITION_POINTS.length);
                }
                this.targetPosition = { ...REPOSITION_POINTS[nextPointIndex] };
            } else { // Repositioning
                this.aiState = 'ATTACKING';
                this.stateTimer = 480 + Math.random() * 240; // 8-12 seconds of attacking
            }
        }

        // State Actions
        switch (this.aiState) {
            case 'ATTACKING':
                // Hover near the player to attack
                this.targetPosition = {
                    x: player.x,
                    y: player.y - TILE_SIZE * 6,
                };
                if (guardianState !== 'vulnerable') {
                    this.handleAttacks(guardianState, guardian, player, actions);
                }
                break;
            case 'REPOSITIONING':
                // Move towards the chosen reposition point. No action needed here as target is already set.
                break;
        }

        actions.push({ type: 'MOVE', payload: this.targetPosition });
        
        return actions;
    }

    private handleAttacks(guardianState: GuardianState, guardian: GameObject, player: Player, actions: AIAction[]) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }

        const newAttacks: GameObject[] = [];
        const speedMultiplier = guardianState === 'phase3' ? 1.8 : guardianState === 'phase2' ? 1.4 : 1;
        const attackRateMultiplier = guardianState === 'phase3' ? 1.6 : guardianState === 'phase2' ? 1.3 : 1;
        
        const rand = Math.random();
        let attackType: 'orb' | 'rune' | 'bolt';
        if (rand < 0.45) {
            attackType = 'orb';
        } else if (rand < 0.9) {
            attackType = 'rune';
        } else {
            attackType = 'bolt';
        }
       
        if (attackType === 'orb') {
            const angle = Math.atan2((player.y + player.height/2) - (guardian.y + guardian.height/2), (player.x + player.width/2) - (guardian.x + guardian.width/2));
            const speed = 8 * speedMultiplier; // Orbs are faster and direct
            
            newAttacks.push({
                id: this.attackIdCounter++,
                type: GameObjectType.GuardianAttack,
                attackType: 'orb',
                x: guardian.x + guardian.width / 2 - 15,
                y: guardian.y + guardian.height / 2 - 15,
                width: 30,
                height: 30,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
            });
            
            this.attackCooldown = Math.floor(40 / attackRateMultiplier);
        } else if (attackType === 'rune') {
            const runeCount = guardianState === 'phase3' ? 8 : guardianState === 'phase2' ? 5 : 3;
            const spreadRange = TILE_SIZE * 10;
            
            for (let i = 0; i < runeCount; i++) {
                const offsetX = (Math.random() - 0.5) * spreadRange;
                const spawnX = Math.max(
                    ARENA_BOUNDS.x + TILE_SIZE,
                    Math.min(player.x + offsetX, ARENA_BOUNDS.x + ARENA_BOUNDS.width - TILE_SIZE * 2)
                );
                
                newAttacks.push({
                    id: this.attackIdCounter++,
                    type: GameObjectType.GuardianAttack,
                    attackType: 'rune',
                    x: spawnX,
                    y: TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    vx: 0,
                    vy: (7 + Math.random() * 2) * speedMultiplier
                });
            }
            
            this.attackCooldown = Math.floor(65 / attackRateMultiplier);
        } else if (attackType === 'bolt') {
            const angle = Math.atan2((player.y + player.height / 2) - (guardian.y + guardian.height / 2), (player.x + player.width / 2) - (guardian.x + guardian.width / 2));
            const speed = 15 * speedMultiplier;
            
            newAttacks.push({
                id: this.attackIdCounter++,
                type: GameObjectType.GuardianAttack,
                attackType: 'bolt',
                x: guardian.x + guardian.width / 2 - 20,
                y: guardian.y + guardian.height / 2 - 4,
                width: 40,
                height: 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
            });
            
            this.attackCooldown = Math.floor(60 / attackRateMultiplier);
        }
        
        if (newAttacks.length > 0) {
            actions.push({ type: 'SPAWN_ATTACKS', payload: newAttacks });
        }
    }

    public reset(): void {
        this.attackCooldown = 0;
        this.aiState = 'ATTACKING';
        this.stateTimer = 300;
    }
}