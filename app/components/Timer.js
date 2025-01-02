import React from 'react';
import { StyleSheet, View, Button, Text, Image } from 'react-native';

function Timer(props) {
    return (
        <View style={styles.container}>
            <View style={styles.timer}>
                <Text style={[styles.modeTitle, styles.textFlexBox]}>pomodoro</Text>
                <Text style={[styles.timerText, styles.textFlexBox]}>25:00</Text>
            </View>
            <View style={styles.buttons}>
                <View style={[styles.restartButton, styles.buttonFlexBox]}>
                    <Image style={styles.icon} resizeMode="cover" source={require("../assets/restart.png")} />
                </View>
                <View style={[styles.playButton, styles.buttonFlexBox]}>
                    <Image style={styles.icon} resizeMode="cover" source={require("../assets/play.png")} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    textFlexBox: {
        textAlign: 'left',
        color: '#151514'
    },
    buttonFlexBox: {
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
        width: 18,
        height: 18
    },
    restartButton: {
        
    },
    playButton: {

    },
    buttons: {
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