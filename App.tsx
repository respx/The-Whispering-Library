import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Dialogue, Level } from './types';
import Game from './components/Game';
import FinalLevel from './components/FinalLevel';
import StartMenu from './components/ui/StartMenu';
import PauseMenu from './components/ui/PauseMenu';
import LevelCompleteScreen from './components/ui/LevelCompleteScreen';
import SettingsMenu from './components/ui/SettingsMenu';
import AboutScreen from './components/ui/AboutScreen';
import EndingScreen from './components/ui/EndingScreen';
import CheatConsole from './components/ui/CheatConsole';
import audioService from './services/audioService';
import { story } from './game/story';
import { useLanguage } from './context/LanguageContext';
import { level1, level2, level3, level4 } from './game/levels';

const levels: Level[] = [level1, level2, level3, level4];

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.StartMenu);
    const [showSettings, setShowSettings] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [collectedBooks, setCollectedBooks] = useState<number[]>([]);
    const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [showCheatConsole, setShowCheatConsole] = useState(false);
    const [cheatInput, setCheatInput] = useState("");
    const [cheatCodeSequence, setCheatCodeSequence] = useState("");
    const [applyVirusCheat, setApplyVirusCheat] = useState(false);
    const { language, t, direction } = useLanguage();

    const storyFragments = story[language];
    const currentLevel = levels[currentLevelIndex];

    const handleStartGame = useCallback(() => {
        setCurrentLevelIndex(0);
        setCollectedBooks([]);
        setApplyVirusCheat(false);
        setGameState(GameState.Playing);
        audioService.init();
        audioService.playMusic(0);
    }, []);

    const handlePauseGame = useCallback(() => {
        if ([GameState.Playing, GameState.FinalBattle].includes(gameState)) {
            setGameState(GameState.Paused);
            audioService.setMusicVolume(0.1);
        }
    }, [gameState]);

    const handleResumeGame = useCallback(() => {
        setGameState(currentLevelIndex === 3 ? GameState.FinalBattle : GameState.Playing);
        audioService.setMusicVolume(0.3);
    }, [currentLevelIndex]);

    const handleRestart = useCallback(() => {
        setCollectedBooks([]);
        setApplyVirusCheat(false); // Reset cheat on restart
        setGameState(currentLevelIndex === 3 ? GameState.FinalBattle : GameState.Playing);
        audioService.playMusic(currentLevelIndex);
    }, [currentLevelIndex]);

    const handleExitToMenu = useCallback(() => {
        setGameState(GameState.StartMenu);
        setApplyVirusCheat(false);
        setShowSettings(false);
        setShowAbout(false);
        audioService.stopMusic();
    }, []);

    const handleLevelComplete = useCallback(() => {
        if(currentLevelIndex === 3) {
            setGameState(GameState.Ending);
            audioService.playMusic(4); // Victory music
        } else {
            setGameState(GameState.LevelComplete);
            audioService.setMusicVolume(0.1);
        }
    }, [currentLevelIndex]);

     const handleNextLevel = useCallback(() => {
        const nextLevelIndex = currentLevelIndex + 1;
        if (nextLevelIndex < levels.length) {
            setCurrentLevelIndex(nextLevelIndex);
             const isFinalLevel = nextLevelIndex === 3;
            setGameState(isFinalLevel ? GameState.FinalBattle : GameState.Playing);
            audioService.playMusic(nextLevelIndex);
        } else {
             setGameState(GameState.Ending);
             audioService.playMusic(4);
        }
    }, [currentLevelIndex]);

    const handleBookCollect = useCallback((bookId: number) => {
        if (!collectedBooks.includes(bookId)) {
            setCollectedBooks(prev => [...prev, bookId]);
            const fragment = storyFragments.find(f => f.id === bookId);
            if(fragment) {
                setCurrentDialogue({
                    title: `${t.fragment} ${fragment.id % 100}`,
                    text: fragment.text,
                    character: t.narrator,
                    onDialogueEnd: () => setCurrentDialogue(null)
                });
            }
        }
    }, [collectedBooks, storyFragments, t]);

    const handleCheatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cheat = cheatInput.toUpperCase();
        if (cheat === 'BBC2') {
            handleNextLevel();
        } else if (cheat === 'NN2') {
            setCurrentLevelIndex(levels.length - 1);
            setGameState(GameState.FinalBattle);
            audioService.playMusic(levels.length - 1);
        } else if (cheat === 'VIRUS') {
            setApplyVirusCheat(true);
        }
        setCheatInput("");
        setShowCheatConsole(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // First, handle Escape key for various UI states
            if (e.key === 'Escape') {
                if(showCheatConsole) {
                    setShowCheatConsole(false);
                    setCheatCodeSequence(''); // Reset sequence
                } else if ([GameState.Playing, GameState.FinalBattle].includes(gameState)) {
                    handlePauseGame();
                } else if (gameState === GameState.Paused) {
                    handleResumeGame();
                } else if (showSettings) {
                    setShowSettings(false);
                } else if (showAbout) {
                    setShowAbout(false);
                }
                return; // Stop further processing for Escape key
            }

            // Second, handle cheat code sequence detection.
            // Don't detect if the console is already open or an input is focused.
            if (showCheatConsole || (e.target instanceof HTMLInputElement)) {
                return;
            }
            
            // Append key to sequence and check for match
            const updatedSequence = (cheatCodeSequence + e.key).slice(-3);
            setCheatCodeSequence(updatedSequence);

            if (updatedSequence === '001') {
                setShowCheatConsole(true);
                setCheatCodeSequence(''); // Reset sequence
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, showSettings, showAbout, showCheatConsole, handlePauseGame, handleResumeGame, cheatCodeSequence]);
    
    useEffect(() => {
        if (gameState === GameState.Playing && collectedBooks.length === 0) {
            if (currentLevelIndex === 1) {
                setCurrentDialogue({ character: t.narrator, title: t.level2IntroTitle, text: t.level2IntroText, onDialogueEnd: () => setCurrentDialogue(null) });
            } else if (currentLevelIndex === 2) {
                 setCurrentDialogue({ character: t.narrator, title: t.level3IntroTitle, text: t.level3IntroText, onDialogueEnd: () => setCurrentDialogue(null) });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLevelIndex, gameState, t]);

    const renderGame = () => {
        if (currentLevelIndex === 3) {
             return <FinalLevel
                        key={currentLevelIndex}
                        level={currentLevel}
                        gameState={gameState}
                        onPause={handlePauseGame}
                        onLevelComplete={handleLevelComplete}
                        applyVirusCheat={applyVirusCheat}
                    />;
        }
        return <Game
                    key={currentLevelIndex}
                    level={currentLevel}
                    gameState={gameState}
                    onPause={handlePauseGame}
                    onBookCollect={handleBookCollect}
                    onLevelComplete={handleLevelComplete}
                    setCurrentDialogue={setCurrentDialogue}
                    collectedBooks={collectedBooks}
                    currentDialogue={currentDialogue}
                />;
    }

    const renderContent = () => {
        if (showSettings) {
            return <SettingsMenu onClose={() => setShowSettings(false)} />;
        }
        if (showAbout) {
            return <AboutScreen onClose={() => setShowAbout(false)} />;
        }

        switch (gameState) {
            case GameState.StartMenu:
                return <StartMenu onStart={handleStartGame} onSettings={() => setShowSettings(true)} onAbout={() => setShowAbout(true)} />;
            case GameState.Paused:
                return (
                    <>
                        {renderGame()}
                        <PauseMenu onResume={handleResumeGame} onRestart={handleRestart} onSettings={() => setShowSettings(true)} onExit={handleExitToMenu} />
                    </>
                );
            case GameState.LevelComplete:
                 return <LevelCompleteScreen 
                            collectedFragments={storyFragments.filter(f => collectedBooks.includes(f.id))} 
                            onNextLevel={handleNextLevel} 
                            onExit={handleExitToMenu}
                            isNextLevelFinal={currentLevelIndex === levels.length - 2}
                        />;
            case GameState.Ending:
                return <EndingScreen onExit={handleExitToMenu} />;
            case GameState.Playing:
            case GameState.FinalBattle:
            default:
                return renderGame();
        }
    };

    return (
        <div className="bg-gray-900 w-screen h-screen flex items-center justify-center font-mono overflow-hidden select-none">
            <div className="relative w-[1024px] h-[768px] bg-blue-900 shadow-2xl shadow-cyan-500/20" dir={direction}>
                {renderContent()}
                 { (gameState === GameState.Playing || gameState === GameState.FinalBattle) &&
                    <div 
                        className="absolute bottom-1 left-1 text-xs text-gray-700 font-mono"
                    >
                        v0.0.1
                    </div>
                }
                { showCheatConsole && 
                    <CheatConsole 
                        value={cheatInput}
                        onChange={(e) => setCheatInput(e.target.value)}
                        onSubmit={handleCheatSubmit}
                        onClose={() => setShowCheatConsole(false)}
                    />
                }
            </div>
        </div>
    );
};

export default App;