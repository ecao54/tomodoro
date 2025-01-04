import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
//import Timer from '../components/Timer';
import ButtonBar from '../components/ButtonBar';
import Background from '../components/Background';
import { ChevronRight, Pen } from 'lucide-react-native';

function SettingsScreen(props) {
    const handlePress = () => {
        // Add your press handling logic here
        console.log('button pressed');
    };

    return (
        <Background>
            <View style={styles.parentFrame}>
                <View style={styles.childFrame}>
                    <View style={styles.settingsFrame}>
                        <Text style={styles.subtitles}>settings</Text>
                        <View style={styles.detailsFrame}>
                            <View style={styles.textFormat}>
                                <Text style={styles.bodyText}>account details</Text>
                                <TouchableOpacity 
                                    onPress={() => handlePress()}>
                                    <ChevronRight color="#969691" size={23} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.line} />
                            <View style={styles.textFormat}>
                                <Text style={styles.bodyText}>notifications</Text>
                                <TouchableOpacity 
                                    onPress={() => handlePress()}>
                                    <ChevronRight color="#969691" size={23} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={styles.timerFrame}>
                        <View style={styles.textFormat}>
                            <Text style={styles.subtitles}>timer durations</Text>
                            <TouchableOpacity 
                                onPress={() => handlePress()}>
                                <View style={styles.editFrame}>
                                    <Text style={styles.edit}>edit</Text>
                                    <Pen color="#969691" size={18} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.detailsFrame}>
                            <View style={styles.textFormat}>
                                <Text style={styles.bodyText}>pomodoro</Text>
                                <Text style={styles.userInput}>25 min</Text>
                            </View>
                            <View style={styles.line}/>
                            <View style={styles.textFormat}>
                                <Text style={styles.bodyText}>short break</Text>
                                <Text style={styles.userInput}>5 min</Text>
                            </View>
                            <View style={styles.line}/>
                            <View style={styles.textFormat}>
                                <Text style={styles.bodyText}>long break</Text>
                                <Text style={styles.userInput}>15 min</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <ButtonBar />
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
        gap: 36
    },
    settingsFrame: {
        alignSelf: "stretch",
        width: '100%',
        justifyContent: "space-between",
        gap: 24
    },
    timerFrame: {
        alignSelf: "stretch",
        width: '100%',
        justifyContent: "space-between",
        gap: 24
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
        fontFamily: "Anuphan-SemiBold",
        color: "#151514",
        textAlign: "left"
    },
    bodyText: {
        fontSize: 18,
        color: "#151514",
        alignSelf: 'flex-start'
    },
    line: {
        borderStyle: "solid",
        borderColor: "#e4e0d9",
        borderTopWidth: 1,
        flex: 1,
        width: "100%",
        height: 1  
    },
    userInput: {
        textAlign: "left",
        color: "#151514",
        fontSize: 18,
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold"
    },
    textFormat: {
        alignSelf: "stretch",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    editFrame: {
        flexDirection: "row",
        gap: 4
    },
    edit: {
        fontSize: 14,
        fontFamily: "Anuphan-Regular",
        color: "#969691",
        textAlign: "left"
    }
});

export default SettingsScreen;