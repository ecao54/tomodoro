import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import Timer from '../components/Timer';
import ButtonBar from '../components/ButtonBar';
import Background from '../components/Background';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signOut } from 'firebase/auth';
import { API_URL } from '../config/api';

function SettingsScreen( { timerValues, onUpdate }) {
    const navigation = useNavigation();
    const route = useRoute();
    const [localValues, setLocalValues] = useState({
        pomodoro: "25",
        shortBreak: "5",
        longBreak: "10"
    });
    const [isLoading, setIsLoading] = useState(true);
    
    const handlePress = () => {
        console.log('button pressed');
    };

    useFocusEffect(
        React.useCallback(() => {
            loadSavedValues();
        }, [])
    );
    
    const loadSavedValues = async () => {
        try {
            setIsLoading(true);
            const user = FIREBASE_AUTH.currentUser;
            if (!user) return;
    
            const token = await user.getIdToken();
            const response = await fetch(`${API_URL}/users/${user.uid}/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                if (data.settings?.timerValues) {
                    setLocalValues(data.settings.timerValues);
                    onUpdate?.(data.settings.timerValues);
                }
            }
        } catch (error) {
            console.error('Error loading saved values:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(FIREBASE_AUTH);
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out');
        }
    };

    const displayValues = timerValues || localValues;

    return (
        <Background>
            <View style={styles.parentFrame}>
                <View style={styles.childFrame}>
                    <Text style={styles.subtitles}>settings</Text>
                    <View style={styles.settingsFrame}>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('TimerDurations', {
                                currentValues: timerValues,
                                onSave: onUpdate
                            })}>
                            <View style={styles.timerFrame}>
                                <View style={styles.textFormat}>
                                    <Text style={styles.bodyText}>timer durations</Text>
                                    <ChevronRight color="#969691" size={23} /> 
                                </View>
                                <View style={styles.durationFrame}>
                                    <View style={styles.pomodoroFrame}>
                                        <Text style={[styles.bodyText, { fontFamily: "Anuphan-SemiBold" }]}>pomodoro</Text>
                                        <Text style={[styles.bodyText, { fontFamily: "Anuphan-SemiBold" }]}>short break</Text>
                                        <Text style={[styles.bodyText, { fontFamily: "Anuphan-SemiBold" }]}>long break</Text>
                                    </View>
                                    <View style={styles.pomodoroFrame}>
                                        <Text style={styles.bodyText}>
                                            {isLoading ? '...' : `${displayValues.pomodoro} minutes`}
                                        </Text>
                                        <Text style={styles.bodyText}>
                                            {isLoading ? '...' : `${displayValues.shortBreak} minutes`}
                                        </Text>
                                        <Text style={styles.bodyText}>
                                            {isLoading ? '...' : `${displayValues.longBreak} minutes`}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.line} />
                        <View style={styles.detailsFrame}>
                            <TouchableOpacity onPress={() => handlePress()}>
                                <View style={styles.textFormat}>
                                    <Text style={styles.bodyText}>account details</Text>
                                    <ChevronRight color="#969691" size={23} />
                                </View>
                            </TouchableOpacity>
                            <View style={styles.line} />
                            <TouchableOpacity onPress={() => handlePress()}>
                                <View style={styles.textFormat}>
                                    <Text style={styles.bodyText}>notifications</Text>
                                    <ChevronRight color="#969691" size={23} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSignOut}>
                                <View style={styles.textFormat}>
                                    <Text style={styles.bodyText}>sign out</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            <ButtonBar/>
        </Background>
    );
}

const styles = StyleSheet.create({
    parentFrame: {
        paddingTop: 150,
        justifyContent: 'flex-start',
    },
    childFrame: {
        flex: 1,
        width: 343,
        gap: 24
    },
    settingsFrame: {
        alignSelf: "stretch",
        width: '100%',
        justifyContent: "space-between",
        gap: 16
    },
    timerFrame: {
        alignSelf: "stretch",
        width: '100%',
        justifyContent: "space-between",
        gap: 12
    },
    durationFrame: {
        alignSelf: "stretch",
        width: 208,
        alignItems: "center",
        gap: 20,
        flexDirection: 'row',
        paddingLeft: 24
    },
    pomodoroFrame: {
        gap: 12
    },
    detailsFrame: {
        alignSelf: "stretch",
        width: 343,
        alignItems: "center",
        gap: 16
    },
    subtitles: {
        fontSize: 24,
        color: "#151514",
        fontFamily: "Anuphan-SemiBold"
    },
    bodyText: {
        fontSize: 18,
        color: "#151514",
        fontFamily: "Anuphan-Regular",
    },
    line: {
        borderColor: "#e4e0d9",
        borderTopWidth: 1,
        width: "100%",
    },
    textFormat: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});

export default SettingsScreen;