import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

function buttonBar(props) {
    return (
        <View style={styles.background}>
            <View style={styles.buttonBar}>
                <View style={styles.homeButton}></View>
                <View style={styles.friendsButton}></View>
                <View style={styles.statsButton}></View>
                <View style={styles.settingsButton}></View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "#FDFAF6",
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '36',

    },
    buttonBar: {
        width: '87%', 
        height: '7.28%', 
        paddingLeft: 18, 
        paddingRight: 18, 
        paddingTop: 8,
        paddingBottom: 8, 
        backgroundColor: '#686864', 
        borderRadius: 15, 
        gap: 25, 
    },
    /* homeButton: {
        width: '100%',
        height: 70,
        backgroundColor: "fc5c65",
    },
    friendsButton: {
        width: '100%',
        height: 70,
        backgroundColor: "fc5c65",
    },
    statsButton: {
        width: '100%',
        height: 70,
        backgroundColor: "fc5c65",
    },
    settingsButton: {
        width: '100%',
        height: 70,
        backgroundColor: "fc5c65",
    } */
})
export default buttonBar;