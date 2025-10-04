

class AudioService {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private isInitialized = false;
    private musicInterval: number | null = null;

    init() {
        if (this.isInitialized || typeof window === 'undefined') return;
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.isInitialized = true;
    }

    private playSound(type: OscillatorType, frequency: number, duration: number, volume: number = 0.5, ramp: boolean = true) {
        this.init();
        if (!this.audioContext || !this.masterGain) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        if (ramp) {
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        }

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
        return gainNode;
    }

    playJump() { this.playSound('sine', 440, 0.1, 0.2); }
    playDoubleJump() { this.playSound('sine', 660, 0.1, 0.2); }
    playCollect() { this.playSound('sine', 880, 0.1, 0.3); setTimeout(() => this.playSound('sine', 1046.5, 0.1, 0.3), 100); }
    playImpact() { this.playSound('square', 110, 0.2, 0.4); }
    playLand() { this.playSound('sine', 150, 0.15, 0.25); }
    playTrap() { this.playSound('sawtooth', 100, 0.3, 0.4); }
    playScrape() { this.playSound('sawtooth', 80, 0.1, 0.15); }
    playTeleport() { this.playSound('sawtooth', 200, 0.1, 0.2); this.playSound('sawtooth', 800, 0.1, 0.2); }
    playPlatformCrumble() { this.playSound('square', 100, 0.2, 0.1); this.playSound('square', 80, 0.2, 0.1); }
    playTimerTick() { this.playSound('sine', 1500, 0.05, 0.08); }
    playPuzzleComplete() { const notes = [523.25, 659.25, 783.99, 1046.5]; notes.forEach((n, i) => setTimeout(() => this.playSound('triangle', n, 0.15, 0.3), i * 100)); }
    playBeep() { this.playSound('square', 1200, 0.05, 0.05); }
    playHover() { this.playSound('sine', 1000, 0.05, 0.1); }
    playClick() { this.playSound('triangle', 600, 0.1, 0.2); }

    // Final Level Sounds
    playGuardianShoot() { this.playSound('sawtooth', 200, 0.3, 0.3); }
    playShieldHit() { this.playSound('square', 800, 0.1, 0.3); }
    playGuardianPhaseChange() {
        this.init();
        if (!this.audioContext || !this.masterGain) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.8);
        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.0);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 1.0);
    }
    playShieldActivate() {
        const gain = this.playSound('sine', 150, 0.5, 0.3, false);
        gain?.gain.exponentialRampToValueAtTime(0.2, this.audioContext!.currentTime + 0.1);
        gain?.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.5);
    }
    playMagicBurst() {
        this.playSound('sawtooth', 400, 0.5, 0.4);
        this.playSound('sawtooth', 200, 0.5, 0.4);
    }
    playGuardianRumble() { this.playSound('sawtooth', 50, 0.8, 0.2); }
    playCrystalCollect() { const notes = [1046.5, 1318.51]; notes.forEach((n, i) => setTimeout(() => this.playSound('triangle', n, 0.2, 0.3), i * 120)); }
    playVictoryMelody() {
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 1046.50];
        notes.forEach((note, i) => {
            setTimeout(() => this.playSound('sine', note, 0.3, 0.25), i * 150);
        });
    }

    playMusic(levelIndex: number = 0, phase: 'phase1' | 'phase2' | 'phase3' | 'default' = 'default') {
        this.init();
        if (!this.audioContext || !this.masterGain) return;
        this.stopMusic();

        this.musicGain = this.audioContext.createGain();
        this.setMusicVolume(0.3);
        this.musicGain.connect(this.masterGain);
        
        const finalBattleMusic = {
            phase1: { notes: [110.00, 110.00, 123.47, 110.00, 146.83, 146.83, 130.81, 110.00], interval: 350, type: 'sawtooth'},
            phase2: { notes: [123.47, 123.47, 130.81, 123.47, 164.81, 164.81, 146.83, 123.47], interval: 280, type: 'sawtooth'},
            phase3: { notes: [130.81, 146.83, 110.00, 164.81, 130.81, 146.83, 110.00, 185.00], interval: 220, type: 'square'}
        };

        const levelMusic = [
            { notes: [220, 261.63, 293.66, 329.63], interval: 500, type: 'sine' }, // Level 1
            { notes: [196.00, 220.00, 261.63, 246.94], interval: 500, type: 'sine' }, // Level 2
            { notes: [130.81, 146.83, 110.00, 164.81], interval: 500, type: 'sine' }, // Level 3
            finalBattleMusic.phase1, // Final Battle default
            { notes: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25], interval: 600, type: 'triangle'} // Victory
        ];

        let music;
        if (levelIndex === 3 && phase !== 'default') {
            music = finalBattleMusic[phase];
        } else {
            music = levelMusic[levelIndex % levelMusic.length];
        }

        let noteIndex = 0;
        
        const playNote = () => {
            if (!this.musicGain || !this.audioContext) return;
            const musicSource = this.audioContext.createOscillator();
            musicSource.type = music.type as OscillatorType;
            musicSource.frequency.value = music.notes[noteIndex % music.notes.length];
            musicSource.connect(this.musicGain);
            musicSource.start();
            musicSource.stop(this.audioContext.currentTime + music.interval / 1000 * 0.9);
            noteIndex++;
        };
        
        playNote();
        this.musicInterval = window.setInterval(playNote, music.interval);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        if (this.musicGain && this.audioContext) {
            this.musicGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
            this.musicGain = null;
        }
    }
    
    setMusicVolume(volume: number) {
        if(this.musicGain && this.audioContext) {
            this.musicGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    setMasterVolume(volume: number) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }
    
    getMasterVolume() {
        return this.masterGain ? this.masterGain.gain.value : 1;
    }
}

const audioService = new AudioService();
export default audioService;