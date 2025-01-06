import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { TouchableWithoutFeedback } from 'react-native';

function Timer(props) {
    const { timerValues = {
        pomodoro: '25',
        shortBreak: '5',
        longBreak: '15'
    }} = props;

    const POMODORO = parseInt(timerValues.pomodoro) * 60; // 25 minutes in seconds
    const SHORT_BREAK = parseInt(timerValues.shortBreak) * 60; // 5 minutes in seconds
    const LONG_BREAK = parseInt(timerValues.longBreak) * 60; // 15 minutes in seconds

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

    useEffect(() => {
        // Update the current timer if it's not running
        if (!isRunning) {
            switch (mode) {
                case 'pomodoro':
                    setTimeRemaining(POMODORO);
                    break;
                case 'short break':
                    setTimeRemaining(SHORT_BREAK);
                    break;
                case 'long break':
                    setTimeRemaining(LONG_BREAK);
                    break;
            }
        }
    }, [timerValues, mode]);
    
    const handlePlayPause = () => {
        if (isRunning) {
            handleRestart();
        } else {
            setIsRunning(true);
        }
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

    const handleDisruption = () => {
        if (isRunning && mode === 'pomodoro') {
            handleRestart();
        }
    }

    return (
        <TouchableWithoutFeedback onPress={handleDisruption}>
            <View style={styles.container}>
                <View style={styles.timer}>
                    <Text style={styles.modeTitle}>{mode}</Text>
                    <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [
                        { backgroundColor: pressed ? '#D8D3CA' : '#e4e0d9' },
                        styles.button
                    ]}
                    onPress={handlePlayPause}
                >
                    {isRunning ? (
                            <RotateCcw style={styles.icon} size={20} />
                        ) : (
                            <Play style={styles.icon} size={20} />
                        )}
                </Pressable>
                {/* <View style={styles.buttonsContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            { backgroundColor: pressed ? '#D8D3CA' : '#e4e0d9' },
                            styles.button
                        ]}
                        onPress={handlePlayPause}
                    >
                        {isRunning ? (
                            <Pause style={styles.icon} size={18} />
                        ) : (
                            <Play style={styles.icon} size={18} />
                        )}
                    </Pressable>
                </View> */}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    button: {
        alignSelf: "stretch",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        borderBottomLeftRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
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
        borderTopLeftRadius: 15,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 15,
        paddingVertical: 12,
        flex: 1,
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
        width: 293,
        top: 70,
        gap: 8,
        position: "absolute",
        alignItems: 'center',
        flexDirection: 'row'
    }
});

export default Timer;
