import { Animated, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import Background from '../components/Background'
import { FIREBASE_AUTH } from '../../FirebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, OAuthProvider } from 'firebase/auth';
import appleAuth from '@invertase/react-native-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

const FloatingLabelInput = ({ label, value, onChangeText, secureTextEntry, ...props }) => {
    const [animation] = useState(new Animated.Value(value ? 1 : 0));
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        Animated.timing(animation, {
            toValue: (isFocused || value.length > 0) ? 1 : 0,
            duration: 75,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);
  
    const labelStyle = {
        position: 'absolute',
        left: 0,
        top: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 8],
        }),
        fontSize: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 14],
        }),
        color: '#686864',
    };
  
    return (
        <View style={styles.floatingInputContainer}>
            <View style={styles.inputWrapper}>
                <Animated.Text style={labelStyle} numberOfLines={1}>
                    {label}
                </Animated.Text>
                <TextInput
                    style={styles.floatingInput}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
        </View>
    );
};

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const auth = FIREBASE_AUTH;

    const handlePress = () => {
        console.log('button pressed');
    };

    const signIn = async () => {
        setEmailError('');
        setPasswordError('');

        let hasError = false;

        if (email === '') {
            setEmailError('please enter email');
            hasError = true;
        }

        if (password === '') {
            setPasswordError('please enter password');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
            switch (error.code) {
                case 'auth/invalid-email':
                    setEmailError('invalid email');
                    break;
                case 'auth/user-not-found':
                    setEmailError('invalid email');
                    break;
                case 'auth/wrong-password':
                    setPasswordError('incorrect password');
                    break;
                case 'auth/invalid-credential':
                    setPasswordError('incorrect password');
                    break;
                case 'auth/network-request-failed':
                    setEmailError('network error, check your connection');
                    break;
                default:
                    setEmailError('sign in failed: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    }

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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.parentFrame}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.subtitle}>log in to your account</Text>
                    </View>
                    <View style={styles.bottomContainer}>
                        <View style={styles.loginFrame}>
                            <View style={styles.emailFrame}>
                                <View style={styles.inputFrame}>
                                    <View style={styles.inputButton}>
                                        <FloatingLabelInput
                                            label="email or username" 
                                            value={email}  
                                            autoCapitalize="none"
                                            onChangeText={(text) => {
                                                setEmail(text)
                                                setEmailError('')
                                            }}
                                        />
                                    </View>
                                    {emailError ? (
                                        <Text style={styles.errorText}>{emailError}</Text>
                                    ) : null}

                                    <View style={styles.inputButton}>
                                        <View style={{ flex: 1 }}>
                                            <FloatingLabelInput 
                                                secureTextEntry={!showPassword} 
                                                value={password}  
                                                label="password" 
                                                onChangeText={(text) => {
                                                    setPassword(text)
                                                    setPasswordError('')
                                                }}
                                            />
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            {showPassword ? 
                                                <Eye color="#686864" size={23} /> : 
                                                <EyeOff color="#686864" size={23} />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                    {passwordError ? (
                                        <Text style={styles.errorText}>{passwordError}</Text>
                                    ) : null}
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
                                    onPress={handleAppleSignIn}>
                                    <Image source={require('../assets/apple-logo.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.alternativeButton}
                                    onPress={handleGoogleSignIn}>
                                    <Image source={require('../assets/google-logo.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.createAccountFrame}>
                            <Text style={[styles.inputButtonText, {color: "#535350"}]}>new user? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.createAccountText}>create an account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
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
        justifyContent: "center",
        paddingTop: 175
    },
    bottomContainer: {
        justifyContent: 'flex-end',
        paddingBottom: 10,
        gap: 153
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
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: 61,
        flexDirection: 'row',
        alignItems: 'center'
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
    },
    floatingInputContainer: {
        flex: 1,
        height: 61,
    },
    inputWrapper: {
        flex: 1,
        position: 'relative',
    },
    floatingInput: {
        flex: 1,
        fontSize: 18,
        color: '#151514',
        paddingTop: 16,
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        fontSize: 14,
        fontFamily: "Anuphan-Regular",
        color: "#a81f10",
        marginLeft: 8,
    },
});

export default Login;

