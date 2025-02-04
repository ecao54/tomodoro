import { Animated, View, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { ChevronLeft } from 'lucide-react-native';
import { API_URL } from '../config/api';

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
        left: 16,
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

const InfoInput = ({ navigation, route }) => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [nameError, setNameError] = useState('');
    const { onProfileUpdate } = route.params || {};

    useEffect(() => {
        const checkExistingProfile = async () => {
            try {
                const user = FIREBASE_AUTH.currentUser;
                if (user) {
                    const token = await user.getIdToken();
                    const response = await fetch(`${API_URL}/users/${user.uid}/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const profile = await response.json();
                        if (profile.username && profile.firstName && profile.lastName) {
                            navigation.replace('Home');
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking profile:', error);
            }
        };

        checkExistingProfile();
    }, []);

    const signUp = async () => {
        setUsernameError('');
        setNameError('');
        let hasError = false;
        
        if (username === '') {
            setUsernameError('please enter username');
            hasError = true;
        }

        if (firstName === '' || lastName === '') {
            setNameError('please enter first and last name');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const user = FIREBASE_AUTH.currentUser;
            
            if (!user) throw new Error('No authenticated user found');
            const checkResponse = await fetch(`${API_URL}/users/check-username/${username}`, {
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                    'Accept': 'application/json'
                }
            });
    
            if (!checkResponse.ok) {
                const errorData = await checkResponse.json();
                if (checkResponse.status === 409) {
                    setUsernameError('username already exists');
                    setLoading(false);
                    return;
                }
                throw new Error(errorData.message || 'Failed to check username');
            }

            const token = await user.getIdToken();
            const profileResponse = await fetch(`${API_URL}/users/${user.uid}/profile`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    firstName,
                    lastName
                })
            });
    
            if (!profileResponse.ok) {
                throw new Error('Failed to update profile');
            }

            if (onProfileUpdate) {
                await onProfileUpdate();
            }
    
        } catch (error) {
            console.error('Error creating profile:', error);
            setNameError('Error creating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Background>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.parentFrame}>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("SignUp")}
                        style={styles.backButton}
                    >
                        <ChevronLeft size={30} color="#535350" />
                    </TouchableOpacity>
                    <Text style={styles.subtitle}>create your account</Text>
                    <View style={styles.touchableFrame}>
                        <View style={styles.inputFrame}>
                            <FloatingLabelInput
                                label="create a username*" 
                                value={username}  
                                autoCapitalize="none"
                                onChangeText={(text) => {
                                    setUsername(text);
                                    setUsernameError('');
                                }}
                            />
                            {usernameError ? (
                                <Text style={styles.errorText}>{usernameError}</Text>
                            ) : null}
                            <View style={styles.nameInputFrame}>
                                <View style={styles.nameInputButton}>
                                    <FloatingLabelInput 
                                        value={firstName}  
                                        label="first name*" 
                                        onChangeText={(text) => {
                                            setFirstName(text);
                                            setNameError('');
                                        }}
                                    />
                                </View>
                                <View style={styles.nameInputButton}>
                                    <FloatingLabelInput 
                                        value={lastName}  
                                        label="last name*" 
                                        onChangeText={(text) => {
                                            setLastName(text);
                                            setNameError('');
                                        }}
                                    />
                                </View>
                            </View>
                            {nameError ? (
                                <Text style={styles.errorText}>{nameError}</Text>
                            ) : null}
                        </View>
                        <View style={styles.itemFrame}>
                            <View style={styles.buttonFrame}>
                                <TouchableOpacity 
                                    style={[styles.button, { backgroundColor: "#61892d" }]}
                                    onPress={signUp}
                                    disabled={loading}
                                >
                                    <View style={styles.buttonTextFrame}>
                                        <Text style={[styles.buttonText, { color: "#fdfaf6" }]}>
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </Text>
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
};

const styles = StyleSheet.create({
    parentFrame: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingTop: 200,
        paddingBottom: 60, 
        width: '100%',
        gap: 42
    },
    buttonFrame: {
        gap: 12,
    },
    itemFrame: {
        gap: 24,
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
    inputFrame: {
        gap: 12,
        width: '100%',
    },
    touchableFrame: {
        justifyContent: 'space-between',
        flex: 1,
    },
    floatingInputContainer: {
        height: 61,
        width: '100%',
        backgroundColor: '#f3f0ea',
        borderRadius: 15,
    },
    inputWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    floatingInput: {
        flex: 1,
        fontSize: 18,
        color: '#151514',
        paddingTop: 16,
    },
    errorText: {
        fontSize: 14,
        fontFamily: "Anuphan-Regular",
        color: "#a81f10",
        marginLeft: 8,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 25, 
        zIndex: 1
    },
    nameInputFrame: {
        flexDirection: 'row',
        width: '100%',
        gap: 10
    },
    nameInputButton: {
        borderRadius: 15,
        backgroundColor: "#f3f0ea",
        flex: 1,
        height: 61,
        flexDirection: 'row',
        alignItems: 'center'
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
});

export default InfoInput;