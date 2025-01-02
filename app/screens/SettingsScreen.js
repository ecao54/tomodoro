import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
//import Timer from '../components/Timer';
import ButtonBar from '../components/ButtonBar';
import Background from '../components/Background';

function SettingsScreen(props) {
    return (
        <Background>
            <ButtonBar />
        </Background>
    );
}

export default SettingsScreen;