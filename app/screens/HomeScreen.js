import React, { useState, useEffect, useRef } from 'react';
import { ImageBackground, StyleSheet, View, Text, Pressable } from 'react-native';
import ButtonBar from '../components/ButtonBar';
import { Play, RotateCcw } from 'lucide-react-native';
import { TouchableWithoutFeedback } from 'react-native-web';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { API_URL } from '../config/api';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

function HomeScreen(props) {
    const { timerValues = {
        pomodoro: '25',
        shortBreak: '5',
        longBreak: '15'
    }} = props;

    const POMODORO = parseInt(timerValues.pomodoro) * 60; // 25 minutes in seconds
    const SHORT_BREAK = parseInt(timerValues.shortBreak) * 60; // 5 minutes in seconds
    const LONG_BREAK = parseInt(timerValues.longBreak) * 60; // 15 minutes in seconds

    const [cycleCount, setCycleCount] = useState(0);
    const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'short break', 'long break'
    const [timeRemaining, setTimeRemaining] = useState(POMODORO);
    const [isRunning, setIsRunning] = useState(false);
    const [imageSource, setImageSource] = useState(require('../assets/tomato-base.png')); // Initial image

    const getImageSource = () => {
        if (cycleCount === 0 && mode === 'pomodoro') return require('../assets/tomato-base.png');
        if (cycleCount === 1) return require('../assets/tomato-1.png');
        if (cycleCount === 2) return require('../assets/tomato-2.png');
        if (cycleCount === 3) return require('../assets/tomato-3.png');
        if (cycleCount === 0 && mode === 'long break') return require('../assets/tomato-4.png');
    };

    const updateStats = async (sessionType) => {
        try {
            const user = FIREBASE_AUTH.currentUser;
            if (!user) {
                console.log('No user logged in');
                return;
            }
    
            const token = await user.getIdToken();
            console.log('Making request to:', `${API_URL}/stats/update`);

            const response = await fetch(`${API_URL}/stats/update`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.uid,
                    sessionType: sessionType,
                    duration: parseInt(timerValues.pomodoro),
                    settings: {
                        pomodoro: timerValues.pomodoro,
                        shortBreak: timerValues.shortBreak,
                        longBreak: timerValues.longBreak
                    }
                })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Stats updated successfully:', data);
        } catch (error) {
            console.error('Error updating stats:', {
                message: error.message,
                stack: error.stack,
                url: `${API_URL}/stats/update`
            });
        }
    };

    const scheduleNotification = async (mode) => {
        try {
            let message;
            switch(mode) {
                case 'pomodoro':
                    message = "Time's up! Let's take a short break";
                    break;
                case 'short break':
                    message = "Break's over! Back to work";
                    break;
                case 'long break':
                    message = "Long break finished! Ready to start fresh?";
                    break;
            }
    
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Tomodoro',
                    body: message,
                    sound: true,
                },
                trigger: null,
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    };
    
    // Handle play
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
    }, [isRunning]); // Re-run effect when isRunning changes

    useEffect(() => {
        const newImage = getImageSource();
        if (newImage !== imageSource) {
            setImageSource(newImage);
        }
    }, [cycleCount, mode]); // Re-run effect when cycleCount or mode changes

    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Notification permissions not granted');
                }
            } catch (error) {
                console.error('Error requesting notification permissions:', error);
            }
        };
    
        requestPermissions();
    }, []);
    
    const handleRestart = () => {
        setMode('pomodoro');
        setTimeRemaining(POMODORO);
        setCycleCount(0);
        setIsRunning(false);
    };

    const handleModeSwitch = () => {
        if (mode === 'pomodoro') {
            updateStats('tomato');
            scheduleNotification('pomodoro');
            if (cycleCount < 3) {
                setMode('short break');
                setTimeRemaining(SHORT_BREAK);
                setCycleCount(cycleCount + 1);
            } else {
                updateStats('plant');
                scheduleNotification('long break');
                setMode('long break');
                setTimeRemaining(LONG_BREAK);
                setCycleCount(0);
            }
        } else {
            scheduleNotification(mode);
            setMode('pomodoro');
            setTimeRemaining(POMODORO);
        }
        setIsRunning(false);
    };

    const handlePlay = () => {
        if (!isRunning) {
            setIsRunning(true);
        } else {
            handleRestart();
        }
    }

    // Not yet in use
    const handleDisruption = () => {
        if (isRunning && mode === 'pomodoro') {
            handleRestart();
        }
    }

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

        <ImageBackground style={styles.imageBackground} source={imageSource}>
            {/* <TouchableWithoutFeedback onPress={handleDisruption}> */}
            <View style={styles.timerContainer}>
                <View style={styles.timer}>
                    <Text style={styles.modeTitle}>{mode}</Text>
                    <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [
                        { backgroundColor: pressed ? '#D8D3CA' : '#e4e0d9' },
                        styles.button
                    ]}
                    onPress={handlePlay}
                >
                    {isRunning ? (
                            <RotateCcw style={styles.icon} size={20} />
                        ) : (
                            <Play style={styles.icon} size={20} />
                        )}
                </Pressable>
            </View>
            <ButtonBar />
            {/* </TouchableWithoutFeedback> */}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFAF6",
    },
    imageBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
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
    timerContainer: {
        width: 293,
        top: 70,
        gap: 8,
        position: "absolute",
        alignItems: 'center',
        flexDirection: 'row'
    }
});

export default HomeScreen;
