import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import ButtonBar from '../components/ButtonBar';
import Timer from '../components/TImer';

function HomeScreen() {
    return (
        <Background>
            <Timer />
            <ButtonBar />
        </Background>
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