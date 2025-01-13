import { KeyboardAvoidingView, Platform, Text, StyleSheet, View, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard, Pressable } from 'react-native';
import Background from '../components/Background';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useState, useRef } from 'react';

const defaultValues = {
    pomodoro: '25',
    shortBreak: '5',
    longBreak: '15'
};

function TimerDurations(props) {
    const navigation = useNavigation();
    const route = useRoute();
    
    const { currentValues, onSave } = route.params || {
        currentValues: defaultValues,
        onSave: () => {}
    };

    const pomodoroRef = useRef(null);
    const shortBreakRef = useRef(null);
    const longBreakRef = useRef(null);

    const [pomodoroTime, setPomodoroTime] = useState(
        currentValues.pomodoro === defaultValues.pomodoro ? '' : currentValues.pomodoro
    );
    const [shortBreakTime, setShortBreakTime] = useState(
        currentValues.shortBreak === defaultValues.shortBreak ? '' : currentValues.shortBreak
    );
    const [longBreakTime, setLongBreakTime] = useState(
        currentValues.longBreak === defaultValues.longBreak ? '' : currentValues.longBreak
    );

    const handleSave = () => {
        const newValues = {
            pomodoro: pomodoroTime || defaultValues.pomodoro,
            shortBreak: shortBreakTime || defaultValues.shortBreak,
            longBreak: longBreakTime || defaultValues.longBreak
        };
        onSave(newValues);
        navigation.goBack();
    };

    const handleReset = () => {
        setPomodoroTime('');
        setShortBreakTime('');
        setLongBreakTime('');
    };

    const handleInputChange = (value, setter) => {
        setter(value);
        hasChanges(true);
    };

    const hasChanges = () => {
        const isPomodoroDifferent = 
            !(pomodoroTime === '' && currentValues.pomodoro === defaultValues.pomodoro) && 
            pomodoroTime !== currentValues.pomodoro;
            
        const isShortBreakDifferent = 
            !(shortBreakTime === '' && currentValues.shortBreak === defaultValues.shortBreak) && 
            shortBreakTime !== currentValues.shortBreak;
            
        const isLongBreakDifferent = 
            !(longBreakTime === '' && currentValues.longBreak === defaultValues.longBreak) && 
            longBreakTime !== currentValues.longBreak;
        
        return isPomodoroDifferent || isShortBreakDifferent || isLongBreakDifferent;
    };
    
    
    
    return (
        <Background>
                <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.parentFrame}>
                        <View style={styles.childFrame}>
                            <View style={styles.headerFrame}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => navigation.navigate('Settings')}> 
                                    <ChevronLeft color="#151514" size={30} />  
                                </TouchableOpacity>
                                <Text style={styles.subtitles}>timer durations</Text>
                            </View>
                            <View style={styles.pomodoroFrame}>
                                <Text style={styles.pomodoroText}>pomodoro</Text>
                                <Pressable 
                                    style={styles.pomodoroInput}
                                    onPress={() => pomodoroRef.current.focus()}>
                                    <TextInput
                                        ref={pomodoroRef}
                                        style={[styles.pomodoroText, {color: "#151514"}]}
                                        value={pomodoroTime}
                                        onChangeText={(value) => handleInputChange(value, setPomodoroTime)}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        placeholder={defaultValues.pomodoro}
                                        placeholderTextColor="#969691"
                                    />
                                    <Text style={styles.pomodoroText}>minutes</Text>
                                </Pressable>
                            </View>
                            <View style={styles.pomodoroFrame}>
                                <Text style={styles.pomodoroText}>short break</Text>
                                <Pressable 
                                    style={styles.pomodoroInput}
                                    onPress={() => shortBreakRef.current.focus()}>
                                    <TextInput
                                        ref={shortBreakRef}
                                        style={[styles.pomodoroText, {color: "#151514"}]}
                                        value={shortBreakTime}
                                        onChangeText={setShortBreakTime}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        placeholder={defaultValues.shortBreak}
                                        placeholderTextColor="#969691"
                                    />
                                    <Text style={styles.pomodoroText}>minutes</Text>
                                </Pressable>
                            </View>
                            <View style={styles.pomodoroFrame}>
                                <Text style={styles.pomodoroText}>long break</Text>
                                <Pressable 
                                    style={styles.pomodoroInput}
                                    onPress={() => longBreakRef.current.focus()}>
                                    <TextInput
                                        ref={longBreakRef}
                                        style={[styles.pomodoroText, {color: "#151514"}]}
                                        value={longBreakTime}
                                        onChangeText={setLongBreakTime}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        placeholder={defaultValues.longBreak}
                                        placeholderTextColor="#969691"
                                    />
                                    <Text style={styles.pomodoroText}>minutes</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View style={styles.buttonFrame}>
                            <TouchableOpacity 
                                style={[styles.resetButton, styles.buttonGeneral]}
                                onPress={handleReset}>
                                <Text style={[styles.buttonText, {color: "#151514"}]}>reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.saveButton, 
                                    styles.buttonGeneral, 
                                    !hasChanges() && styles.disabledButton
                                ]}
                                disabled={!hasChanges()}
                                onPress={handleSave}>
                                <Text style={[
                                    styles.buttonText, 
                                    {color: hasChanges() ? "#FDFAF6" : "#969691"}
                                ]}>save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Background>
    );
}

const styles = StyleSheet.create({ 
    parentFrame: {
        flex: 1,
        paddingTop: 77,
        paddingHorizontal: 25,
        width: '100%',
        justifyContent: 'space-between'
    },
    childFrame: {
        gap: 24,
    },
    headerFrame: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: '100%'
    },
    backButton: {
        position: 'absolute',
        left: 0,
        zIndex: 1
    },
    subtitles: {
        fontSize: 24,
        fontWeight: "600",
        color: "#151514",
        textAlign: 'center',
        flex: 1
    },
    pomodoroFrame: {
        width: '100%',
        gap: 4,
        textAlign: "left",
    },
    pomodoroText: {
        fontFamily: "Anuphan-Regular",
        fontSize: 18
    },
    pomodoroInput: {
        borderRadius: 10,
        backgroundColor: "#f3f0ea",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignSelf: "stretch",
        alignItems: 'center'
    },
    buttonFrame: {
        alignSelf: 'stretch',
        width: '100%',
        gap: 12,
        flexDirection: 'row',
        marginBottom: 40,
    },
    buttonGeneral: {
        paddingVertical: 14,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        flexDirection: "row"
    },
    resetButton: {
        backgroundColor: "#e4e0d9",
        width: 96,
    },
    saveButton: {
        backgroundColor: "#61892d",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    buttonText: {
        textAlign: "left",
        fontFamily: "Anuphan-SemiBold",
        fontWeight: "600",
        fontSize: 18
    },
    disabledButton: {
        backgroundColor: '#E4E0D9',
    }
});

export default TimerDurations; 