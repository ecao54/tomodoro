import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text, Image } from 'react-native';
import { RotateCcw, Play } from 'lucide-react-native';

function Timer(props) {
    const [timeRemaining, setTimeRemaining] = useState(1500);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let intervalId;
        if (isRunning) {
          intervalId = setInterval(() => {
            setTimeRemaining((prevSeconds) => {
              if (prevSeconds <= 0) {
                clearInterval(intervalId);
                setIsRunning(false);
                return 0;
              } else {
                return prevSeconds - 1;
              }
            });
          }, 1000);
        }

        return () => clearInterval(intervalId);
      }, [isRunning, timeRemaining]);

      const handlePlay = () => {
        if (!isRunning) {
            setIsRunning(true);
        } else {
            setIsRunning(false);
        }
      };
    
      const handleRestart = () => {
        setIsRunning(false);
        setTimeRemaining(1500);
      };
    
    return (
        <View style={styles.container}>
            <View style={styles.timer}>
                <Text style={[styles.modeTitle, styles.textFlexBox]}>pomodoro</Text>
                <Text style={[styles.timerText, styles.textFlexBox]}>{timeRemaining}</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <Pressable
                    style={styles.button}
                    onPress={handleRestart}
                >
                    <RotateCcw style={styles.icon} size={18}/>
                </Pressable>      
                <Pressable
                    style={styles.button}
                    onPress={handlePlay}
                >
                    <Play style={styles.icon} size={18}/>
                </Pressable>     
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    textFlexBox: {
        textAlign: 'left',
        color: '#151514'
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#e4e0d9',
        flex: 1
    },
    modeTitle: {
        fontSize: 18,
        fontFamily: 'Anuphan-Regular'
    },
    timerText: {
        fontSize: 60,
        fontWeight: '500',
        fontFamily: 'Anuphan-Medium',
        marginTop: -2
    },
    timer: {
        borderRadius: 15,
        paddingHorizontal: 60,
        paddingVertical: 12,
        justifyContent: 'center',
        backgroundColor: '#e4e0d9',
        alignSelf: 'stretch',
        alignItems: 'center',
        overflow: 'hidden'
    },
    icon: {
        color: '#151514',
    },
    restartButton: {
        
    },
    playButton: {

    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",
        gap: 8
    },
    container: {
        width: 283,
        gap: 8,
        flex: 1,
        marginTop: 70
    }
})

export default Timer;