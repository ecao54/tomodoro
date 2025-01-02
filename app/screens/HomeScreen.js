import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Timer from '../components/Timer';
import ButtonBar from '../components/ButtonBar';

function HomeScreen() {
    return (
        <View style={styles.background}>
            <Timer />
            <ButtonBar />
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