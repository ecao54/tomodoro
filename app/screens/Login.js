import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Background from '../components/Background'
import { FIREBASE_AUTH } from '../../FirebaseConfig'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const auth = FIREBASE_AUTH;

    const handlePress = () => {
        console.log('button pressed');
    };

    const signIn = async () => {
        if (email === '' || password === '') {
            alert('please enter email and password');
            return;
        }
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            navigation.navigate('Home');
        } catch (error) {
            console.log(error);
            alert('sign in failed: ' + error.message)
        } finally {
            setLoading(false);
        }
    } 

    return (
        <Background>
            <View style={styles.parentFrame}>
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.subtitle}>log in to your account</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.loginFrame}>
                        <View style={styles.emailFrame}>
                            <View style={styles.inputFrame}>
                                <View style={styles.inputButton}>
                                    <TextInput 
                                        value={email} 
                                        style={styles.inputButtonText} 
                                        placeholder="email or username" 
                                        onChangeText={(text) => setEmail(text)}>
                                    </TextInput>
                                </View>
                                <View style={styles.inputButton}>
                                    <TextInput 
                                        secureTextEntry={true} 
                                        value={password} 
                                        style={styles.inputButtonText} 
                                        placeholder="password" 
                                        onChangeText={(text) => setPassword(text)}>
                                    </TextInput>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={signIn}
                                disabled={loading}>
                                <Text style={styles.loginButtonText}>
                                    {loading ? 'Logging in...' : 'Log in'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dividerFrame}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.inputButtonText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>
                        <View style={styles.alternativeFrame}>
                            <TouchableOpacity
                                style={styles.alternativeButton}
                                onPress={() => handlePress()}>
                                <Image source={require('../assets/apple-logo.png')}></Image>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.alternativeButton}
                                onPress={() => handlePress()}>
                                <Image source={require('../assets/google-logo.png')}></Image>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.createAccountFrame}>
                            <Text style={[styles.inputButtonText, {color: "#535350"}]}>new user? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.createAccountText}>create an account</Text>
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
        width: '100%',
        paddingHorizontal: 25,
    },
    headerContainer: {
        flex: 1,
        justifyContent: "center"
    },
    bottomContainer: {
        justifyContent: 'flex-end',
        paddingBottom: 45
    },
    subtitle: {
        fontSize: 24,
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold",
        color: "#2a2a28",
        textAlign: "center",
        height: 44,
        justifyContent: 'flex-start'
    },
    loginFrame: {
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
    loginButton: {
        paddingVertical: 14,
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 15,
        alignSelf: "stretch",
        backgroundColor: "#61892d",
        height: 52,
        paddingHorizontal: 76,
        justifyContent: "center"
    },
    loginButtonText: {
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold",
        color: "#fdfaf6",
        textAlign: "center",
        fontSize: 18
    },
    emailFrame: {
        gap: 28
    },
    inputFrame: {
        gap: 12,
    },
    dividerFrame: {
        gap: 8,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row'
    },
    dividerLine: {
        backgroundColor: "#d8d3ca",
        height: 1,
        flex: 1,
    },
    alternativeFrame: {
        gap: 12,
        flexDirection: 'row'
    },
    alternativeButton: {
        borderRadius: 15,
        backgroundColor: "#e4e0d9",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        flex: 1
    },
    createAccountFrame: {
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    createAccountText: {
        textDecoration: "underline",
        color: "#61892d",
        fontSize: 18,
        fontFamily: "Anuphan-Regular",
        textAlign: "left"                
    }
});

export default Login