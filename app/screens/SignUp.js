// SignUp.js
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Background from '../components/Background';
import GoogleLogo from '../assets/google-logo.png';
import AppleLogo from '../assets/apple-logo.png';
import { Mail } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, OAuthProvider } from 'firebase/auth';
import appleAuth from '@invertase/react-native-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

const SignUp = ({ navigation }) => {
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: '576866654863-82fti20tv656ms5qee2c69crljd0l7v5.apps.googleusercontent.com', // Get this from Google Cloud Console
    });
    
    const handleGoogleSignIn = async () => {
        try {
            const result = await promptAsync();
            if (result?.type === 'success') {
                const credential = GoogleAuthProvider.credential(result.params.id_token);
                const firebaseResult = await signInWithCredential(auth, credential);
                console.log(firebaseResult);
                navigation.navigate('Home');
            }
        } catch (error) {
            console.error(error);
            alert('Google sign in failed: ' + error.message);
        }
    };
    
    const handleAppleSignIn = async () => {
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });
    
            const { identityToken } = appleAuthRequestResponse;
            const credential = OAuthProvider.credential('apple.com', identityToken);
            
            const userCredential = await signInWithCredential(auth, credential);
            navigation.navigate('Home');
        } catch (error) {
            console.error(error);
            alert('Apple sign in failed: ' + error.message);
        }
    };

    return (
        <Background>
            <View style={styles.parentFrame}>
                <Text style={styles.subtitle}>create your account</Text>
                <View style={styles.itemFrame}>
                    <View style={styles.buttonFrame}>
                        <TouchableOpacity 
                            style={[styles.button, {backgroundColor: "#e4e0d9"} ]}
                            onPress={handleGoogleSignIn}>
                            <View style={styles.buttonTextFrame}>
                                <Image source={GoogleLogo} style={{width: 21, height: 21 }}/>
                                <Text style={[styles.buttonText, { color: "#535350" }]}>Continue with Google</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, {backgroundColor: "#e4e0d9"} ]}
                            onPress={handleAppleSignIn}>
                            <View style={styles.buttonTextFrame}>
                                <Image source={AppleLogo} width={21} height={21}/>
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