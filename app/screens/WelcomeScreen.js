import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Background from '../components/Background'

const WelcomeScreen = ({ navigation }) => {
    return (
        <Background>
            <View style={styles.parentFrame}>
                <View style={styles.textFrame}>
                    <Text style={styles.smallTitle}>welcome to</Text>
                    <Text style={styles.bigTitle}>tomodoro</Text>
                    <Text>the cure to brainrot.</Text>
                </View>
                <View style={styles.buttonFrame}>
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: "#61892d" } ]}
                        onPress={() => navigation.navigate('SignUp')}>
                            <Text style={[styles.buttonText, { color: "#fdfaf6" }]}>create new account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, {backgroundColor: "#e4e0d9"} ]}
                        onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.buttonText, { color: "#535350" }]}>login to existing account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Background>
            
            
    )
}

const styles = StyleSheet.create({
    parentFrame: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'center',
        paddingHorizontal: 25,
        paddingTop: 274,
        width: '100%',
        gap: 244
    },
    buttonFrame: {
        gap: 12,
    },
    button: {
        borderRadius: 15,
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold",
        textAlign: "center"
    },
    textFrame: {
        alignItems: "center"
    },
    smallTitle: {
        fontSize: 36,
        fontWeight: "500",
        fontFamily: "Anuphan-Medium",
        color: "#151514"
    },
    bigTitle: {
        fontSize: 60,
        lineHeight: 60,
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold",
        color: "#a81f10"
    }
})

export default WelcomeScreen