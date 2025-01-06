import React from 'react';
import { Dimensions, ImageBackground, Image, StyleSheet, View, TouchableWithoutFeedbac, useWindowDimensions} from 'react-native';
import ButtonBar from '../components/ButtonBar';
import Timer from '../components/Timer';
import Background from '../components/Background';

function HomeScreen() {
    return (
        <ImageBackground style={styles.container} source={require('../assets/tomato-base.png')}>
            <Timer />
            <ButtonBar />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFAF6",
        alignItems: 'center',
        justifyContent: 'flex-end',
    }
})

export default HomeScreen;