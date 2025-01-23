import { Text, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import ButtonBar from '../components/ButtonBar';
import Background from '../components/Background';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { API_URL } from '../config/api';
import { BarChart } from "react-native-gifted-charts";

function StatsScreen() {
    const [stats, setStats] = useState({
        tomatoes: 0,
        plants: 0,
        totalMinutes: 0,
        streak: 0,
        currentStreak: 0
    });
    const [loading, setLoading] = useState(true);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState('today');
    const [chartData, setChartData] = useState([]);
    const [selectedType, setSelectedType] = useState('tomatoes');
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [dateOffset, setDateOffset] = useState(0);

    const timeOptions = [
        'today',
        'week',
        'month',
        'year',
        'all time'
    ];

    const handleTypeChange = (type) => {
        setSelectedType(type);
        const newChartData = formatChartData(stats, selectedTimeFrame, type);
        setChartData(newChartData);
    };

    const formatChartData = (data, timeFrame, type) => {
        const now = new Date();
        const offsetDate = new Date();
        const tomatoColors = ['#70150a', '#d84e3f', '#a81f10', '#f9d7d3', '#f1776a', '#a81f10'];
    
        switch(timeFrame) {
            case 'today':
                offsetDate.setDate(now.getDate() + dateOffset);
                const hourlyValues = Array(24).fill(0);
                    
                if (data.sessions) {
                    data.sessions.forEach(session => {
                        const sessionDate = new Date(session.timestamp);
                        // Check if the session is from the offset date
                        if (sessionDate.toDateString() === offsetDate.toDateString() && 
                            session.type === (type === 'tomatoes' ? 'tomato' : 'plant')) {
                            const hour = sessionDate.getHours();
                            hourlyValues[hour]++;
                        }
                    });
                }
                
                return hourlyValues.map((value, hour) => ({
                    value,
                    label: hour % 6 === 0 ? 
                        `${hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour-12}PM` : `${hour}AM`}` : '',
                    frontColor: type === 'tomatoes' ? (hour % 6 === 0 ? '#70150a' : tomatoColors[hour % 6]) : '#D6E7C1'
                }));
                
            case 'week':
                offsetDate.setDate(now.getDate() + (dateOffset * 7));
                const weekStart = new Date(offsetDate);
                weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                
                const weeklyValues = Array(7).fill(0);
                
                if (data.sessions) {
                    data.sessions.forEach(session => {
                        const sessionDate = new Date(session.timestamp);
                        if (sessionDate >= weekStart && sessionDate <= weekEnd && 
                            session.type === (type === 'tomatoes' ? 'tomato' : 'plant')) {
                            const day = sessionDate.getDay();
                            weeklyValues[day]++;
                        }
                    });
                }
    
                const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                return weeklyValues.map((value, i) => ({
                    value,
                    label: days[i],
                    frontColor: type === 'tomatoes' ? '#a81f10' : '#D6E7C1'
            }));
            case 'month':
                offsetDate.setMonth(now.getMonth() + dateOffset);
                const monthStart = new Date(offsetDate.getFullYear(), offsetDate.getMonth(), 1);
                const monthEnd = new Date(offsetDate.getFullYear(), offsetDate.getMonth() + 1, 0);
                
                const monthlyValues = Array(31).fill(0);
                
                if (data.sessions) {
                    data.sessions.forEach(session => {
                        const sessionDate = new Date(session.timestamp);
                        if (sessionDate >= monthStart && sessionDate <= monthEnd && 
                            session.type === (type === 'tomatoes' ? 'tomato' : 'plant')) {
                            const day = sessionDate.getDate() - 1;
                            monthlyValues[day]++;
                        }
                    });
                }
    
                return Array(31).fill(0).map((_, day) => ({
                    value: monthlyValues[day],
                    label: (day + 1) % 7 === 1 && (day + 1) >= 7 ? day.toString() : '',
                    frontColor: type === 'tomatoes' 
                        ? ((day + 1) % 7 === 1 ? '#70150a' : tomatoColors[(day + 1) % 6])
                        : '#D6E7C1'
                }));
                
            case 'year':
                offsetDate.setFullYear(now.getFullYear() + dateOffset);
                const yearStart = new Date(offsetDate.getFullYear(), 0, 1);
                const yearEnd = new Date(offsetDate.getFullYear(), 11, 31);
                
                const yearlyValues = Array(12).fill(0);
                
                if (data.sessions) {
                    data.sessions.forEach(session => {
                        const sessionDate = new Date(session.timestamp);
                        if (sessionDate >= yearStart && sessionDate <= yearEnd && 
                            session.type === (type === 'tomatoes' ? 'tomato' : 'plant')) {
                            const month = sessionDate.getMonth();
                            yearlyValues[month]++;
                        }
                    });
                }
    
                const months = ['J', 'F', 'M', 'A', 'M', 'J', 
                              'J', 'A', 'S', 'O', 'N', 'D'];
                return months.map((month, i) => ({
                    value: yearlyValues[i],
                    label: month,
                    frontColor: type === 'tomatoes' ? '#a81f10' : '#D6E7C1'
                }));
                
            case 'all time':
                const yearRange = 5;
                const allTimeValues = {};
                const currentYear = now.getFullYear();
    
                for (let i = currentYear - yearRange + 1; i <= currentYear; i++) {
                    allTimeValues[i] = 0;
                }
    
                if (data.sessions) {
                    data.sessions.forEach(session => {
                        const year = new Date(session.timestamp).getFullYear();
                        if (allTimeValues.hasOwnProperty(year) &&
                            session.type === (type === 'tomatoes' ? 'tomato' : 'plant')) {
                            allTimeValues[year]++;
                        }
                    });
                }
    
                return Object.keys(allTimeValues).map(year => ({
                    value: allTimeValues[year],
                    label: year.toString(),
                    frontColor: type === 'tomatoes' ? '#a81f10' : '#D6E7C1'
                }));
        }
    };    

    const getTimeRange = (timeFrame, offset = 0) => {
        const now = new Date();
        const offsetDate = new Date();
    
        switch(timeFrame) {
            case 'today':
                offsetDate.setDate(now.getDate() + offset);
                return {
                    start: new Date(offsetDate.setHours(0, 0, 0, 0)),
                    end: new Date(offsetDate.setHours(23, 59, 59, 999))
                };
            case 'week':
                offsetDate.setDate(now.getDate() + (offset * 7));
                const weekStart = new Date(offsetDate);
                weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                return { start: weekStart, end: weekEnd };
            case 'month':
                offsetDate.setMonth(now.getMonth() + offset);
                return {
                    start: new Date(offsetDate.getFullYear(), offsetDate.getMonth(), 1),
                    end: new Date(offsetDate.getFullYear(), offsetDate.getMonth() + 1, 0, 23, 59, 59, 999)
                };
            case 'year':
                offsetDate.setFullYear(now.getFullYear() + offset);
                return {
                    start: new Date(offsetDate.getFullYear(), 0, 1),
                    end: new Date(offsetDate.getFullYear(), 11, 31, 23, 59, 59, 999)
                };
            default:
                return {
                    start: new Date(now.getFullYear() - 4, 0, 1),
                    end: now
                };
        }
    };

    const fetchStats = async (timeFrame, offset = 0) => {
        setIsChartLoading(true);
        try {
            const user = FIREBASE_AUTH.currentUser;
            if (!user) return;
    
            const timeRange = getTimeRange(timeFrame, offset);
            const token = await user.getIdToken();
            const url = `${API_URL}/stats/period?userId=${user.uid}&period=${timeFrame}&offset=${offset}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const data = await response.json();
            console.log('Received data:', data);
            
            const filteredSessions = data.sessions?.filter(session => {
                const sessionDate = new Date(session.timestamp);
                return sessionDate >= timeRange.start && sessionDate <= timeRange.end;
            });
    
            const statsData = {
                ...data,
                sessions: filteredSessions
            };
    
            setStats(statsData);
            setChartData(formatChartData(statsData, timeFrame, selectedType));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsChartLoading(false);
        }
    };

    const getFormattedStatsText = (type, count) => {
        const singular = type === 'tomatoes' ? 'tomato' : 'plant';
        const plural = type === 'tomatoes' ? 'tomatoes' : 'plants';
        return count === 1 ? singular : plural;
    };
    
    const getTimeFrameText = () => {
        switch(selectedTimeFrame) {
            case 'today':
                return 'today';
            case 'week':
                return 'this week';
            case 'month':
                return 'this month';
            case 'year':
                return 'this year';
            case 'all time':
                return '';
            default:
                return 'this year';
        }
    };

    const getFormattedDate = () => {
        const now = new Date();
        const offsetDate = new Date();
        switch(selectedTimeFrame) {
            case 'today':
                offsetDate.setDate(now.getDate() + dateOffset);
                return offsetDate.toLocaleDateString('en-US', {  
                    weekday: 'short', 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'week':
                offsetDate.setDate(now.getDate() + (dateOffset * 7));
                const weekStart = new Date(offsetDate);
                weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return `${weekStart.toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric'
                })} – ${weekEnd.toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}`;
            case 'month':
                offsetDate.setMonth(now.getMonth() + dateOffset);
                const lastDay = new Date(offsetDate.getFullYear(), offsetDate.getMonth() + 1, 0).getDate();
                return `${offsetDate.toLocaleDateString('en-US', { month: 'short' })} 1 – ${lastDay}, ${offsetDate.getFullYear()}`;
            case 'year':
                offsetDate.setFullYear(now.getFullYear() + dateOffset);
                return offsetDate.getFullYear().toString();
            case 'all time':
                return 'All Time';
            default:
                return '';
        }
    };

    const handlePrevious = () => {
        setDateOffset(prev => prev - 1);
    };
    
    const handleNext = () => {
        if (dateOffset < 0) {
            setDateOffset(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (stats.sessions) {
            const newTotalMinutes = stats.sessions.reduce((total, session) => {
                if (session.type === (selectedType === 'tomatoes' ? 'tomato' : 'plant')) {
                    return total + parseInt(session.duration);
                }
                return total;
            }, 0);
            setStats(prev => ({...prev, totalMinutes: newTotalMinutes}));
        }
    }, [selectedType, stats.sessions]);

    useEffect(() => {
        let isMounted = true;
        
        const loadStats = async () => {
            setLoading(true);
            if (FIREBASE_AUTH.currentUser) {
                console.log('Fetching with:', { selectedTimeFrame, dateOffset, selectedType });
                try {
                    await fetchStats(selectedTimeFrame, dateOffset);
                } catch (error) {
                    console.error('Error loading stats:', error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        };
    
        loadStats();
        return () => {
            isMounted = false;
        };
    }, [selectedTimeFrame, dateOffset, selectedType]);

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
                                                    setDateOffset(0);
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
                    <View style={styles.infoFrame}>
                        <View style={styles.switchFrame}>
                            <View style={styles.switchBox}>
                                <TouchableOpacity
                                    style={[
                                        styles.switchButton,
                                        selectedType === 'tomatoes' && styles.selectedTomatoButton
                                    ]}
                                    onPress={() => handleTypeChange('tomatoes')}>
                                    <Text style={[
                                        styles.buttonText,
                                        selectedType === 'tomatoes' && styles.selectedButtonText
                                    ]}>tomatoes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.switchButton,
                                        selectedType === 'plants' && styles.selectedPlantButton
                                    ]}
                                    onPress={() => handleTypeChange('plants')}>
                                    <Text style={[
                                        styles.buttonText,
                                        selectedType === 'plants' && styles.selectedButtonText,
                                        {paddingHorizontal: 12}
                                    ]}>plants</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dataFrame}>
                                <Text style={[styles.dataNumber, selectedType === 'tomatoes' && styles.tomatoData]}>{loading ? '...' : 
                                        selectedType === 'tomatoes' ? stats.tomatoes : stats.plants}</Text>
                                <Text style={styles.dataCaption}>
                                    {`${getFormattedStatsText(selectedType, selectedType === 'tomatoes' ? stats.tomatoes : stats.plants)} grown ${getTimeFrameText()}`}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.graphFrame}>
                            <BarChart
                                data={chartData}
                                barWidth={
                                    selectedTimeFrame === 'today' ? 8 :
                                    selectedTimeFrame === 'week' ? 30 :
                                    selectedTimeFrame === 'month' ? 6.5 :
                                    selectedTimeFrame === 'all time' ? 40 : 16
                                }
                                spacing={
                                    selectedTimeFrame === 'today' ? 4 :
                                    selectedTimeFrame === 'week' ? 15 :
                                    selectedTimeFrame === 'month' ? 3 :
                                    selectedTimeFrame === 'all time' ? 20 : 8
                                }
                                labelWidth={
                                    selectedTimeFrame === 'today' ? 40 : 
                                    selectedTimeFrame === 'week' ? 35 :
                                    selectedTimeFrame === 'month' ? 15 :
                                    selectedTimeFrame === 'all time' ? 45 : 20
                                }
                                hideRules
                                xAxisThickness={0}
                                yAxisThickness={0}
                                noOfSections={2}
                                showYAxisIndices={false}
                                yAxisLabelTextStyle={{
                                    ...styles.yAxisText
                                }}
                                xAxisLabelTextStyle={{
                                    ...styles.xAxisText,
                                    marginLeft: -6
                                }}
                                width={343}
                                maxHeight={200}
                                endSpacing={selectedTimeFrame === 'week' ? 15 : 0}
                                initialSpacing={0}
                                showFractionalValues={false}
                                yAxisLabelWidth={30}
                                showValuesOnTopOfBars={selectedTimeFrame !== 'today' && selectedTimeFrame !== 'month'}
                                barBorderRadius={
                                    selectedTimeFrame === 'today' ? 3 :
                                    selectedTimeFrame === 'week' ? 5 :
                                    selectedTimeFrame === 'month' ? 2 :
                                    selectedTimeFrame === 'year' ? 4 :
                                    selectedTimeFrame === 'all time' ? 5 : 4
                                }
                                disableScroll={true}
                                maxValue={Math.max(...chartData.map(item => item.value))} // Set max value
                                topLabelComponent={(value) => {
                                    if (selectedTimeFrame !== 'today' && selectedTimeFrame !== 'month' && value.value > 0) {
                                        return (
                                            <Text style={{...styles.yAxisText}}>
                                                {value.value}
                                            </Text>
                                        );
                                    }
                                    return null;
                                }}
                                formatYLabel={(label) => {
                                    if (selectedTimeFrame === 'today' || selectedTimeFrame === 'month') {
                                        const maxValue = Math.max(...chartData.map(item => item.value));
                                        if (maxValue === 0) return '0';
                                        if (parseInt(label) === maxValue) return maxValue.toString();
                                        if (parseInt(label) === Math.floor(maxValue/2)) return Math.floor(maxValue/2).toString();
                                        if (parseInt(label) === 0) return '0';
                                    }
                                    return '';
                                }}
                            />
                            <View style={styles.dateSwitch}>
                                {selectedTimeFrame !== 'all time' && (
                                    <TouchableOpacity onPress={handlePrevious}>
                                        <ChevronLeft color="#686864" size={18} strokeWidth={2.5}></ChevronLeft>
                                    </TouchableOpacity>
                                )}
                                <Text style={styles.dateSwitchText}>{getFormattedDate()}</Text>
                                {selectedTimeFrame !== 'all time' && (
                                    <TouchableOpacity onPress={handleNext} disabled={dateOffset === 0}>
                                        <ChevronRight color={dateOffset === 0 ? "#CCCCCC" : "#686864"}  size={18} strokeWidth={2.5}></ChevronRight>
                                    </TouchableOpacity> 
                                )}
                            </View>
                        </View>  
                    </View>
                    <View style={styles.statsFrame}>
                        <View style={styles.statRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>
                                    {selectedTimeFrame === 'today' ? 'current daily streak' : 'longest daily streak'}
                                </Text>
                                <Text style={[styles.statNum]}>
                                    {loading ? '...' : 
                                        selectedTimeFrame === 'today' ? stats.currentStreak : stats.streak}
                                </Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>total duration</Text>
                                <Text style={styles.statNum}>
                                    {loading ? '...' : 
                                        `${stats.totalMinutes} min`}
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
        gap: 28
    },
    childFrame: {
        flex: 1,
        width: 343,
        gap: 36
    },
    infoFrame: {
        gap: 36
    },
    switchFrame: {
        gap: 20,
    },
    dataFrame: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    dataNumber: {
        fontSize: 32,
        fontWeight: "500",
        fontFamily: "Anuphan-Medium",
        color: "#61892d",
    },
    dataCaption: {
        fontSize: 14,
        fontWeight: "500",
        fontFamily: "Anuphan-Medium",
        color: "#686864",
    },
    switchBox: {
        gap: 8,
        paddingVertical: 4,
        paddingHorizontal: 4,
        flexDirection: 'row',
        backgroundColor: '#F3F0EA',
        alignSelf: 'center',
        borderRadius: 14
    },
    switchButton: {
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 10,
        width: 85
    },
    selectedTomatoButton: {
        backgroundColor: '#F9D7D3',
    },
    selectedPlantButton: {
        backgroundColor: '#D6E7C1',
    },
    tomatoData: {
        color: '#a81f10',
    },
    selectedButtonText: {
        color: '#151514',
        fontWeight: '500',
        fontFamily: "Anuphan-Medium",
    },
    graphFrame: {
        gap: 8,
        height: 266,
        width: '100%'
    },
    statsBoxFrame: {
        gap: 12,
        flexDirection: 'row'
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
        backgroundColor: "#F3F0EA",
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
    },
    xAxisText: {
        fontSize: 14,
        fontWeight: "500",
        fontFamily: "Anuphan-Medium",
        color: "#686864",
    },
    yAxisText: {
        fontSize: 14,
        fontFamily: "Anuphan-Regular",
        color: "#686864",
    },
    buttonText: {
        fontSize: 14,
        fontFamily: "Anuphan-Regular",
        color: "#686864",
        textAlign: "left"
    },
    dateSwitch: {
        gap: 8,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    dateSwitchText: {
        fontSize: 14,
        fontFamily: "Anuphan-Regular",
        color: "#686864",
    },
});

export default StatsScreen;
