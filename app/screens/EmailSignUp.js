import { Animated, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import { FIREBASE_AUTH } from '../../FirebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Background from '../components/Background';
import { Eye, EyeOff } from 'lucide-react-native';

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

const EmailSignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');


    const signUp = async () => {
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

        // basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('please enter a valid email address');
            hasError = true;
        }

        // password must contain a symbol or number and at least 8 characters
        const passwordRegex = /^(?=.*[0-9!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('password must contain at least:\n- 8 characters\n- One number or special character');
            hasError = true;
        }  
        
        if (hasError) {
            return;
        }

        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            if (response.user) {
                // Success
            }
        } catch (error) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setEmailError('this email is already registered');
                    break;
                case 'auth/invalid-email':
                    setEmailError('invalid email address');
                    break;
                case 'auth/weak-password':
                    setPasswordError('Password is too weak');
                    break;
                case 'auth/network-request-failed':
                    setPasswordError('network error. please check your connection');
                    break;
                default:
                    setEmailError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Background>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.parentFrame}>
                    <Text style={styles.subtitle}>create your account</Text>
                    <View style={styles.touchableFrame}>
                        <View style={styles.inputFrame}>
                            <View style={styles.inputButton}>
                                <FloatingLabelInput
                                    label="email*" 
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
                                        label="create your password*" 
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
            </TouchableWithoutFeedback>
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
    touchableFrame: {
        justifyContent: 'space-between',
        flex: 1,

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
})

export default EmailSignUp