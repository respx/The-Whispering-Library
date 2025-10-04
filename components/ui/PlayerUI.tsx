import React from 'react';
import { Player } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface PlayerUIProps {
    player: Player;
}

const AbilityIndicator: React.FC<{ label: string, cooldown: number, maxCooldown: number, icon: string, keybind?: string }> = ({ label, cooldown, maxCooldown, icon, keybind }) => {
    const { t } = useLanguage();
    const isReady = cooldown <= 0;
    const fillHeight = isReady ? '100%' : `${100 - (cooldown / maxCooldown * 100)}%`;

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 bg-gray-900 border-2 border-gray-600 rounded-md flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full bg-cyan-500/50 transition-all duration-100" style={{ height: fillHeight }}></div>
                <i className={`bx ${icon} text-3xl z-10 ${isReady ? 'text-cyan-300' : 'text-gray-400'}`}></i>
                {keybind && <div className="absolute bottom-0 right-0 px-1 bg-black/50 text-xs rounded-tl-md">{keybind}</div>}
            </div>
            <div>
                <div className="font-bold">{label}</div>
                <div className={`text-sm ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isReady ? t.ready : `${(cooldown / 60).toFixed(1)}s`}
                </div>
            </div>
        </div>
    );
};

const WeaponIndicator: React.FC<{ player: Player }> = ({ player }) => {
    const { t } = useLanguage();
    const isReloading = player.weaponCooldown > 0;
    const fillHeight = isReloading ? `${100 - (player.weaponCooldown / 15 * 100)}%` : '100%';

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 bg-gray-900 border-2 border-gray-600 rounded-md flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full bg-purple-500/50 transition-all" style={{ height: fillHeight }}></div>
                 <i className={`bx bxs-zap text-3xl z-10 ${!isReloading ? 'text-purple-300' : 'text-gray-400'}`}></i>
                 <div className="absolute bottom-0 right-0 px-1 bg-black/50 text-xs rounded-tl-md">LMB</div>
            </div>
            <div>
                <div className="font-bold">{t.weapon}</div>
                 <div className={`text-sm ${!isReloading ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isReloading ? `${(player.weaponCooldown / 60).toFixed(1)}s` : t.ready}
                </div>
            </div>
        </div>
    );
}


const PlayerUI: React.FC<PlayerUIProps> = ({ player }) => {
    const { t } = useLanguage();
    const hpPercentage = (player.hp / player.maxHp) * 100;

    return (
        <div className="absolute top-4 left-4 text-white p-2 bg-black/50 rounded-lg shadow-lg flex flex-col gap-3">
            {/* HP Bar */}
            <div className="w-64">
                <span className="font-bold text-lg">{t.hp}</span>
                <div className="w-full bg-gray-700 rounded-full h-4 border border-gray-900">
                    <div
                        className="bg-red-500 h-full rounded-full transition-all duration-200"
                        style={{ width: `${hpPercentage}%` }}
                    ></div>
                </div>
            </div>
            
            {/* Abilities */}
            <div className="flex gap-4">
                <AbilityIndicator label={t.burst} cooldown={player.burstCooldown} maxCooldown={480} icon="bxs-show" keybind="F" />
                {player.hasWeapon && <WeaponIndicator player={player} />}
                {player.hasWeapon && <AbilityIndicator label={t.overcharge} cooldown={player.overchargeCooldown} maxCooldown={1800} icon="bxs-comet" keybind="X" />}
            </div>
        </div>
    );
};

export default PlayerUI;