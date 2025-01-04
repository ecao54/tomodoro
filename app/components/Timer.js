import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';

function Timer() {
    const POMODORO = 1500; // 25 minutes in seconds
    const SHORT_BREAK = 300; // 5 minutes in seconds
    const LONG_BREAK = 900; // 15 minutes in seconds

    const [timeRemaining, setTimeRemaining] = useState(POMODORO);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'short break', 'long break'
    const [cycleCount, setCycleCount] = useState(0);

    useEffect(() => {
        let intervalId;
        if (isRunning) {
            intervalId = setInterval(() => {
                setTimeRemaining((prevSeconds) => {
                    if (prevSeconds <= 0) {
                        clearInterval(intervalId);
                        handleModeSwitch();
                        return 0;
                    } else {
                        return prevSeconds - 1;
                    }
                });
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [isRunning]);

    const handlePlayPause = () => {
        setIsRunning((prev) => !prev);
    };

    const handleRestart = () => {
        setIsRunning(false);
        setMode('pomodoro');
        setTimeRemaining(POMODORO);
        setCycleCount(0);
    };

    const handleModeSwitch = () => {
        if (mode === 'pomodoro') {
            if (cycleCount < 3) {
                setMode('short break');
                setTimeRemaining(SHORT_BREAK);
                setCycleCount(cycleCount + 1);
            } else {
                setMode('long break');
                setTimeRemaining(LONG_BREAK);
                setCycleCount(0);
            }
        } else {
            setMode('pomodoro');
            setTimeRemaining(POMODORO);
        }
        setIsRunning(false);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (minutes > 0) {
            return `${String(minutes)}:${String(secs).padStart(2, '0')}`;
        } else {
            return String(secs);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.timer}>
                <Text style={styles.modeTitle}>{mode}</Text>
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <Pressable
                    style={styles.button}
                    onPress={handleRestart}
                >
                    <RotateCcw style={styles.icon} size={18} />
                </Pressable>
                <Pressable
                    style={styles.button}
                    onPress={handlePlayPause}
                >
                    {isRunning ? (
                        <Pause style={styles.icon} size={18} />
                    ) : (
                        <Play style={styles.icon} size={18} />
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#e4e0d9',
        flex: 1,
    },
    modeTitle: {
        fontSize: 18,
        color: '#151514',
        fontFamily: 'Anuphan-Regular',
    },
    timerText: {
        fontSize: 60,
        fontWeight: '500',
        color: '#151514',
        fontFamily: 'Anuphan-Medium',
        marginTop: -2,
    },
    timer: {
        borderRadius: 15,
        paddingHorizontal: 60,
        paddingVertical: 12,
        justifyContent: 'center',
        backgroundColor: '#e4e0d9',
        alignSelf: 'stretch',
        alignItems: 'center',
        overflow: 'hidden',
    },
    icon: {
        color: '#151514',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: 8,
    },
    container: {
        width: 283,
        gap: 8,
        flex: 1,
        marginTop: 70,
    },
});

export default Timer;
