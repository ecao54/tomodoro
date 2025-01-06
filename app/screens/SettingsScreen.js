import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import Timer from '../components/Timer';
import ButtonBar from '../components/ButtonBar';
import Background from '../components/Background';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

function SettingsScreen(props) {
    const navigation = useNavigation();
    const route = useRoute();
    
    const [timerValues, setTimerValues] = useState({
        pomodoro: '25',
        shortBreak: '5',
        longBreak: '15'
    });

    const handlePress = () => {
        console.log('button pressed');
    };

    useEffect(() => {
        loadSavedValues();
    }, []);

    const loadSavedValues = async () => {
        try {
            const savedValues = await AsyncStorage.getItem('timerValues');
            if (savedValues) {
                setTimerValues(JSON.parse(savedValues));
            }
        } catch (error) {
            console.log('Error loading saved values:', error);
        }
    };

    const handleTimerUpdate = async (newValues) => {
        setTimerValues(newValues);
        try {
            await AsyncStorage.setItem('timerValues', JSON.stringify(newValues));
        } catch (error) {
            console.log('Error saving values:', error);
        }
    };

    return (
        <Background>
            <View style={styles.parentFrame}>
                <View style={styles.childFrame}>
                    <Text style={styles.subtitles}>settings</Text>
                    <View style={styles.settingsFrame}>
                        <TouchableOpacity 
                            //style={[route.name === 'TimerDurations']}
                            onPress={() => navigation.navigate('TimerDurations', {
                                currentValues: timerValues,
                                onSave: handleTimerUpdate
                            })}>
                            <View style={styles.timerFrame}>
                                <View style={styles.textFormat}>
                                    <Text style={styles.bodyText}>timer durations</Text>
                                    <ChevronRight color="#969691" size={23} /> 
                                </View>
                                <View style={styles.durationFrame}>
                                    <View style={styles.pomodoroFrame}>
                                        <Text style={[styles.bodyText, { fontWeight: "600" }]}>pomodoro</Text>
                                        <Text style={[styles.bodyText, { fontWeight: "600" }]}>short break</Text>
                                        <Text style={[styles.bodyText, { fontWeight: "600" }]}>long break</Text>
                                    </View>
                                    <View style={styles.pomodoroFrame}>
                                        <Text style={styles.bodyText}>{timerValues.pomodoro} minutes</Text>
                                        <Text style={styles.bodyText}>{timerValues.shortBreak} minutes</Text>
                                        <Text style={styles.bodyText}>{timerValues.longBreak} minutes</Text>
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
        fontWeight: "600",
        color: "#151514",
    },
    bodyText: {
        fontSize: 18,
        color: "#151514",
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