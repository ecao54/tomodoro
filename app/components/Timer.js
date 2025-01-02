import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

function Timer(props) {
    return (
        <View style={styles.container}>
            <View style={styles.timer}>

            </View>
            <View style={styles.buttons}>
                <Button style={styles.restart}/>
                <Button style={styles.play}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        
    }
})

export default Timer;