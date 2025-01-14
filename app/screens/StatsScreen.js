import { Text, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import ButtonBar from '../components/ButtonBar';
import Background from '../components/Background';
import { ChevronDown } from 'lucide-react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { API_URL } from '../config/api';

function StatsScreen() {
    const [stats, setStats] = useState({
        tomatoes: 0,
        plants: 0,
        totalMinutes: 0,
        streak: 0
    });
    const [loading, setLoading] = useState(true);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState('all time');

    const timeOptions = [
        'past week',
        'past month',
        'past 6 months',
        'past year',
        'all time'
    ];

    const fetchStats = async (timeFrame) => {
        try {
            const user = FIREBASE_AUTH.currentUser;
            if (!user) {
                console.log('No user logged in');
                return;
            }
    
            const token = await user.getIdToken();
            const url = `${API_URL}/stats/period?userId=${user.uid}&period=${timeFrame}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user && isMounted) {
                fetchStats(selectedTimeFrame);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [selectedTimeFrame]);

    return (
        <Background>
            <View style={styles.parentFrame}> 
                <View style={styles.childFrame}> 
                    <View style={styles.insightsFrame}> 
                        <Text style={styles.subtitles}>insights</Text>
                        <View style={styles.dropdownContainer}>
                            <TouchableOpacity 
                                style={styles.timeFrame}
                                onPress={() => setIsDropdownVisible(!isDropdownVisible)}>
                                    <Text style={styles.timeFont}>{selectedTimeFrame}</Text>
                                    <ChevronDown color="#535350" size={16}/>
                            </TouchableOpacity>
                            {isDropdownVisible && (
                                <View style={styles.dropdownParent}>
                                    {timeOptions.map((option, index) => (
                                        <View key={index}>
                                            <TouchableOpacity
                                                style={styles.dropdownChild}
                                                onPress={() => {
                                                    setSelectedTimeFrame(option);
                                                    setIsDropdownVisible(false);
                                                }}>
                                                <Text style={styles.timeFont}>{option}</Text>
                                            </TouchableOpacity>
                                            {index < timeOptions.length - 1 && (
                                                <View style={styles.dropdownLine} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.statsFrame}>
                        <View style={styles.statRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>tomatoes grown</Text>
                                <Text style={styles.statNum}>{loading ? '...' : stats.tomatoes}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>plants grown</Text>
                                <Text style={styles.statNum}>{loading ? '...' : stats.plants}</Text>
                            </View>
                        </View>
                        <View style={styles.statRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>longest daily streak</Text>
                                <Text style={styles.statNum}>{loading ? '...' : stats.streak}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>total duration</Text>
                                <Text style={styles.statNum}>
                                    {loading ? '...' : 
                                        `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`}
                                </Text>
                            </View>
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
    insightsFrame: {
        alignSelf: "stretch",
        width: '100%',
        justifyContent: "space-between",
        flexDirection: 'row',
        alignItems: 'center'
    },
    statsFrame: {
        gap: 12
    },
    timeFrame: {
        borderRadius: 8,
        backgroundColor: "#f3f0ea",
        alignItems: "center",
        flexDirection: 'row',
        paddingLeft: 10,
        paddingTop: 3,
        paddingRight: 6,
        paddingBottom: 3,
        gap: 2
    },
    timeFont: {
        fontSize: 14,
        fontWeight: '600',
        color: "#535350"
    },
    dropdownContainer: {
        position: 'relative',
        zIndex: 999
    },
    dropdownParent: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: "#f3f0ea",
        shadowColor: "rgba(0, 0, 0, 0.3)",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 8,
        elevation: 8,
        shadowOpacity: 1,
        width: 129,
        zIndex: 1000,
        overflow: 'hidden',
        borderRadius: 8
    },
    dropdownChild: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#f3f0ea",
    },
    dropdownLine: {
        alignSelf: "center",
        borderStyle: "solid",
        borderColor: "#e4e0d9",
        borderTopWidth: 1,
        height: 1,
        width: '75%'
    },
    statRow: {
        flexDirection: 'row',
        gap: 12
    },
    statBox: {
        flex: 1,
        borderRadius: 15,
        backgroundColor: "#e4e0d9",
        width: "100%",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12
    },
    subtitles: {
        fontSize: 24,
        fontWeight: "600",
        fontFamily: "Anuphan-SemiBold",
        color: "#151514",
        textAlign: "left"
    },
    statLabel: {
        fontSize: 14,
        fontFamily: "Anuphan-Regular",
        color: "#151514",
        textAlign: "center",
        width: '100%',
    },
    statNum: {
        fontSize: 32,
        fontWeight: "500",
        fontFamily: "Anuphan-Medium",
        color: "#151514",
    }
});

export default StatsScreen;
