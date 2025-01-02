import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Timer, buttonBar } from '../components';

function HomeScreen(props) {
    return (
        <View style={styles.background}>
            <Timer />
            <buttonBar />
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
})

export default HomeScreen;