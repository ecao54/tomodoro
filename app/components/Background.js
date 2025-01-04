import React from 'react';
import { StyleSheet, View } from 'react-native';

function Background({ children }) {
    return (
        <View style={styles.background}>
            {children}
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

export default Background;