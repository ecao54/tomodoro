import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Timer, Users, ChartColumn, Settings } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

function ButtonBar() {
    const navigation = useNavigation();
    const route = useRoute();

    return (
        <View style={styles.buttonBar}>
            <TouchableOpacity 
                style={[styles.button, route.name === 'Home' && styles.activeButton]}
                onPress={() => navigation.navigate('Home')}>
                <Timer color="#FBFBF2" size={30} /> 
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, route.name === 'Friends' && styles.activeButton]}
                onPress={() => navigation.navigate('Friends')}>
                <Users color="#FBFBF2" size={30} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, route.name === 'Stats' && styles.activeButton]}
                onPress={() => navigation.navigate('Stats')}>
                <ChartColumn color="#FBFBF2" size={30} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, route.name === 'Settings' && styles.activeButton]}
                onPress={() => navigation.navigate('Settings')}>
                <Settings color="#FBFBF2" size={30} />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    buttonBar: {
        width: 343, 
        height: 62, 
        paddingLeft: 18, 
        paddingRight: 18, 
        paddingTop: 8,
        paddingBottom: 8, 
        backgroundColor: '#686864', 
        borderRadius: 15,
        flexDirection: 'row',
        gap: 25,
        justifyContent: 'center',
        bottom: 36
    },
    button: {
        width: 58,
        height: 46,
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#686864',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeButton: {
        backgroundColor: '#969691'
    }
});

export default ButtonBar;