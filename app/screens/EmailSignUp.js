// SignUp.js
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../../FirebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Background from '../components/Background';
import Google from '../assets/google-logo.png';
import Apple from '../assets/apple-logo.png';
import { Mail } from 'lucide-react-native';

const EmailSignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const signUp = async () => {
        // basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // password must contain a symbol or number and at least 8 characters
        const passwordRegex = /^(?=.*[0-9!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must contain at least:\n- 8 characters\n- One number or special character');
            return;
        }  

        if (email === '' || password === '') {
            alert('please enter email and password');
            return;
        }
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            console.log('Sign up response:', response); // More detailed logging
            
            if (response.user) {
                alert('Account created successfully');
            }
        } catch (error) {
            console.log('Sign up error:', error.code, error.message); // More detailed error logging
            let errorMessage = 'Sign up failed';
    
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection';
                    break;
                default:
                    errorMessage = `Sign up failed: ${error.message}`;
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <Background>
            <View style={styles.parentFrame}>
                <Text style={styles.subtitle}>create your account</Text>
                <View style={styles.touchableFrame}>
                    <View style={styles.inputFrame}>
                        <View style={styles.inputButton}>
                            <TextInput 
                                value={email} 
                                style={styles.inputButtonText} 
                                placeholder="email" 
                                onChangeText={(text) => setEmail(text)}>
                            </TextInput>
                        </View>
                        <View style={styles.inputButton}>
                            <TextInput 
                                secureTextEntry={true} 
                                value={password} 
                                style={styles.inputButtonText} 
                                placeholder="create your password" 
                                onChangeText={(text) => setPassword(text)}>
                            </TextInput>
                        </View>
                    </View>
                    <View style={styles.itemFrame}>
                        <View style={styles.buttonFrame}>
                            <TouchableOpacity 
                                style={[styles.button, { backgroundColor: "#61892d" } ]}
                                onPress={signUp}
                                disabled={loading}>
                                <View style={styles.buttonTextFrame}>
                                    <Text style={[styles.buttonText, { color: "#fdfaf6" }]}>{loading ? 'Creating Account...' : 'Continue'}</Text>
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
        paddingTop: 200,
        paddingBottom: 27, 
        width: '100%',
        gap: 42
    },
    buttonFrame: {
        gap: 12,
    },
    button: {
        borderRadius: 15,
        width: '100%',
        alignItems: "center",
        justifyContent: 'space-between',
        paddingVertical: 14,
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
    inputFrame: {
        gap: 12,
    },
    inputButton: {
        borderRadius: 15,
        backgroundColor: "#f3f0ea",
        width: "100%",
        justifyContent: "center",
        paddingHorizontal: 16,
        height: 61
    },
    inputButtonText: {
        fontSize: 18,
        fontFamily: "Anuphan-Regular",
        color: "#686864",
        textAlign: "left"
    },
    touchableFrame: {
        justifyContent: 'space-between',
        flex: 1,

    }
})

export default EmailSignUp