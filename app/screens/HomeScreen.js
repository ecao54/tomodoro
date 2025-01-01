import React from 'react';
import { ImageBackground, StyleSheet, View, buttonBar } from 'react-native';

function HomeScreen(props) {
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

export default HomeScreen;