// SignUp.js
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Background from '../components/Background';
import Google from '../assets/google-logo.png';
import Apple from '../assets/apple-logo.png';
import { Mail } from 'lucide-react-native';

const SignUp = ({ navigation }) => {

    return (
        <Background>
            <View style={styles.parentFrame}>
                <Text style={styles.subtitle}>create your account</Text>
                <View style={styles.itemFrame}>
                    <View style={styles.buttonFrame}>
                        <TouchableOpacity 
                            style={[styles.button, {backgroundColor: "#e4e0d9"} ]}
                            onPress={() => navigation.navigate('Login')}>
                            <View style={styles.buttonTextFrame}>
                                <Image source={Google} style={{width: 21, height: 21 }}/>
                                <Text style={[styles.buttonText, { color: "#535350" }]}>Continue with Google</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, {backgroundColor: "#e4e0d9"} ]}
                            onPress={() => navigation.navigate('Login')}>
                            <View style={styles.buttonTextFrame}>
                                <Image source={Apple} width={21} height={21}/>
                                <Text style={[styles.buttonText, { color: "#535350" }]}>Continue with Apple</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, { backgroundColor: "#61892d" } ]}
                            onPress={() => navigation.navigate('EmailSignUp')}>
                            <View style={styles.buttonTextFrame}>
                                <Mail color="#FDFAF6" size={21} /> 
                                <Text style={[styles.buttonText, { color: "#fdfaf6" }]}>Continue with email</Text>
                            </View>
                                
                        </TouchableOpacity>
                    </View>
                    <View style={styles.existingAccountFrame}>
                        <Text style={[styles.existingAccountText, {color: "#535350"}]}>already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.existingAccountText, {color: "#61892d"}]}>log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    parentFrame: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingTop: 362,
        paddingBottom: 27, 
        width: '100%',
    },
    buttonFrame: {
        gap: 12,
    },
    button: {
        borderRadius: 15,
        width: '100%',
        alignItems: "flex-start",
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingLeft: 20
    },
    buttonTextFrame: {
        gap: 47,
        flexDirection: 'row',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold",
        textAlign: "center"
    },
    subtitle: {
        fontSize: 24,
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold",
        color: "#2a2a28",
        textAlign: "center",
    },
    existingAccountFrame: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    existingAccountText: {
        fontSize: 18,
        fontFamily: "Anuphan-Regular",
        textAlign: "left"
    },
    itemFrame: {
        gap: 24,
    },
})

export default SignUp