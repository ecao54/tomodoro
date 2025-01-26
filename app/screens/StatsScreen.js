import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import ButtonBar from "../components/ButtonBar";
import Background from "../components/Background";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { API_URL } from "../config/api";
import { BarChart } from "react-native-gifted-charts";

function StatsScreen() {
  const [stats, setStats] = useState({
    tomatoes: 0,
    plants: 0,
    totalMinutes: 0,
    streak: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("today");
  const [chartData, setChartData] = useState([]);
  const [selectedType, setSelectedType] = useState("tomatoes");
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);

  const timeOptions = ["today", "week", "month", "year", "all time"];

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setDateOffset(0);
    const newChartData = formatChartData(stats, selectedTimeFrame, type);
    setChartData(newChartData);
  };

  const formatChartData = (data, timeFrame, type) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const offsetDate = new Date();
    const getTomatoColorByValue = (value, maxValue) => {
      if (value === 0) return "#f9d7d3";
      const percentage = (value / maxValue) * 100;
  
      if (percentage <= 25) return "#f1776a";
      if (percentage <= 50) return "#d84e3f";
      if (percentage <= 75) return "#a81f10";
      return "#70150a";
    };
    const getPlantColorByValue = (value, maxValue) => {
      if (value === 0) return "#d6e7c1";
      const percentage = (value / maxValue) * 100;
    
      if (percentage <= 25) return "#b0d184"; 
      if (percentage <= 50) return "#8bb05b";
      if (percentage <= 75) return "#61892d";
      return "#425923";
    };

    const getDisplayValue = (value, isPastOrCurrent, maxValue) => {
      if (!isPastOrCurrent) return 0;  // Future periods
  if (value > 0) {
    // Add padding for views with top labels
    if (selectedTimeFrame === "week" || 
        selectedTimeFrame === "year" || 
        selectedTimeFrame === "all time") {
      return value / 1.036;  // Reduce bar height by ~3.6%
    }
    return value;  // Keep original height for other views
  }
  return maxValue * 0.015;        // Empty bars: 1.4% of max value
    };

    const getMaxValue = (values) => {
      if (!values || values.length === 0) return 1;
      const nonZeroValues = values.filter(v => v > 0);
      return nonZeroValues.length > 0 ? Math.max(...nonZeroValues) : 1;
    };

    switch (timeFrame) {
      case "today":
        offsetDate.setDate(now.getDate() + dateOffset);
        const hourlyValues = Array(24).fill(0);

        if (data.sessions) {
          data.sessions.forEach((session) => {
            const sessionDate = new Date(session.timestamp);
            if (
              sessionDate.toDateString() === offsetDate.toDateString() &&
              session.type === (type === "tomatoes" ? "tomato" : "plant")
            ) {
              const hour = sessionDate.getHours();
              hourlyValues[hour]++;
            }
          });
        }

        return hourlyValues.map((value, hour) => {
            const isPastOrCurrent = dateOffset < 0 || (dateOffset === 0 && hour <= currentHour);
            const maxHourly = getMaxValue(hourlyValues);
            const labelColor = type === "tomatoes" 
              ? (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                hour === currentHour ? "#A81F10" : 
                hour < currentHour ? "#686864" : "#969691")
              : (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                hour === currentHour ? "#61892d" : 
                hour < currentHour ? "#686864" : "#969691");

          return {
            value: getDisplayValue(value, isPastOrCurrent, maxHourly),
            label:
              hour % 6 === 0
                ? `${
                    hour === 0
                      ? "12AM"
                      : hour === 12
                      ? "12PM"
                      : hour > 12
                      ? `${hour - 12}PM`
                      : `${hour}AM`
                  }`
                : "",
            frontColor: type === "tomatoes" 
              ? getTomatoColorByValue(value, maxHourly) 
              : getPlantColorByValue(value, maxHourly),
                labelTextStyle: {
                    color: labelColor,
                    marginLeft: -6,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Anuphan-Medium",
                },
            };
        });

      case "week":
        offsetDate.setDate(now.getDate() + dateOffset * 7);
        const weekStart = new Date(offsetDate);
        weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weeklyValues = Array(7).fill(0);

        if (data.sessions) {
          data.sessions.forEach((session) => {
            const sessionDate = new Date(session.timestamp);
            if (
              sessionDate >= weekStart &&
              sessionDate <= weekEnd &&
              session.type === (type === "tomatoes" ? "tomato" : "plant")
            ) {
              const day = sessionDate.getDay();
              weeklyValues[day]++;
            }
          });
        }

        const maxWeekly = getMaxValue(weeklyValues);
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return days.map((day, i) => {
            const isPastOrCurrent = dateOffset < 0 || (dateOffset === 0 && i <= currentDay);
            const labelColor = type === "tomatoes" 
              ? (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                i === currentDay ? "#A81F10" : 
                i < currentDay ? "#686864" : "#969691")
              : (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                i === currentDay ? "#61892d" : 
                i < currentDay ? "#686864" : "#969691");
            return {
                value: getDisplayValue(weeklyValues[i], isPastOrCurrent, maxWeekly),
                label: day,
                frontColor: type === "tomatoes" 
                  ? getTomatoColorByValue(weeklyValues[i], maxWeekly) 
                  : getPlantColorByValue(weeklyValues[i], maxWeekly),
                labelTextStyle: {
                    color: labelColor,
                    marginLeft: -6,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Anuphan-Medium",
                },
                topLabelComponent: () => (
                    <Text style={{
                        fontSize: 14,
                        fontFamily: "Anuphan-Regular",
                        color: "#686864",
                        marginBottom: 4
                    }}>
                        {isPastOrCurrent ? weeklyValues[i] : ''}
                    </Text>
                )
            };
        });

      case "month":
        offsetDate.setMonth(now.getMonth() + dateOffset);
        const monthStart = new Date(
          offsetDate.getFullYear(),
          offsetDate.getMonth(),
          1
        );
        const monthEnd = new Date(
          offsetDate.getFullYear(),
          offsetDate.getMonth() + 1,
          0
        );
        const monthlyValues = Array(31).fill(0);
       

        if (data.sessions) {
          data.sessions.forEach((session) => {
            const sessionDate = new Date(session.timestamp);
            if (
              sessionDate >= monthStart &&
              sessionDate <= monthEnd &&
              session.type === (type === "tomatoes" ? "tomato" : "plant")
            ) {
              const day = sessionDate.getDate() - 1;
              monthlyValues[day]++;
            }
          });
        }

        const maxMonthly = getMaxValue(monthlyValues);
        return Array(31).fill(0).map((_, day) => {
            const isPastOrCurrent = dateOffset < 0 || (dateOffset === 0 && day + 1 <= currentDate);
            const labelColor = type === "tomatoes" 
              ? (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                day === currentDate ? "#A81F10" : 
                day < currentDate ? "#686864" : "#969691")
              : (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                day === currentDate ? "#61892d" : 
                day < currentDate ? "#686864" : "#969691");
            return {
              value: getDisplayValue(monthlyValues[day], isPastOrCurrent, maxMonthly),
              label: (day + 1) % 7 === 0 && (day + 1) >= 7 ? (day + 1).toString() : "",
              frontColor: type === "tomatoes" 
                ? getTomatoColorByValue(monthlyValues[day], maxMonthly) 
                : getPlantColorByValue(monthlyValues[day], maxMonthly),
                labelTextStyle: {
                    color: labelColor,
                    marginLeft: -6,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Anuphan-Medium",
                },
            };
          });

      case "year":
        offsetDate.setFullYear(now.getFullYear() + dateOffset);
        const yearStart = new Date(offsetDate.getFullYear(), 0, 1);
        const yearEnd = new Date(offsetDate.getFullYear(), 11, 31);
        const yearlyValues = Array(12).fill(0);
       

        if (data.sessions) {
          data.sessions.forEach((session) => {
            const sessionDate = new Date(session.timestamp);
            if (
              sessionDate >= yearStart &&
              sessionDate <= yearEnd &&
              session.type === (type === "tomatoes" ? "tomato" : "plant")
            ) {
              const month = sessionDate.getMonth();
              yearlyValues[month]++;
            }
          });
        }

        const maxYearly = getMaxValue(yearlyValues);
        const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
        return months.map((month, i) => {
          const isPastOrCurrent = dateOffset < 0 || (dateOffset === 0 && i <= currentMonth);
          const labelColor = type === "tomatoes" 
            ? (dateOffset < 0 ? "#686864" : 
              dateOffset > 0 ? "#969691" : 
              i === currentMonth ? "#A81F10" : 
              i < currentMonth ? "#686864" : "#969691")
            : (dateOffset < 0 ? "#686864" : 
              dateOffset > 0 ? "#969691" : 
              i === currentMonth ? "#61892d" : 
              i < currentMonth ? "#686864" : "#969691");
            return {
              value: getDisplayValue(yearlyValues[i], isPastOrCurrent, maxYearly),
                label: month,
                frontColor: type === "tomatoes" 
                  ? getTomatoColorByValue(yearlyValues[i], maxYearly) 
                  : getPlantColorByValue(yearlyValues[i], maxYearly),
                labelTextStyle: {
                    color: labelColor,
                    marginLeft: -4,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Anuphan-Medium",
                },
                topLabelComponent: () => (
                  <View style={{
                    position: 'relative',
                    top: -6,
                    width: '100%',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: "Anuphan-Regular",
                        color: "#686864",
                        textAlign: 'center'
                    }}>
                        {isPastOrCurrent ? yearlyValues[i] : ''}
                    </Text>
                </View>
                )
            };
        });

      case "all time":
        const yearRange = 5;
        const allTimeValues = {};
        const startYear = now.getFullYear();
        const endYear = 2029;
  
        for (let i = startYear; i <= endYear; i++) {
          allTimeValues[i] = 0;
        }

        if (data.sessions) {
          data.sessions.forEach((session) => {
            const year = new Date(session.timestamp).getFullYear();
            if (
              allTimeValues.hasOwnProperty(year) &&
              session.type === (type === "tomatoes" ? "tomato" : "plant")
            ) {
              allTimeValues[year]++;
            }
          });
        }
        
        const maxAllTime = getMaxValue(Object.values(allTimeValues));
        return Object.keys(allTimeValues).map((year) => {
            const yearNum = parseInt(year);
            const isPastOrCurrent = yearNum <= currentYear;
            const labelColor = type === "tomatoes" 
              ? (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                yearNum === currentYear ? "#A81F10" : 
                yearNum < currentYear ? "#686864" : "#969691")
              : (dateOffset < 0 ? "#686864" : 
                dateOffset > 0 ? "#969691" : 
                yearNum === currentYear ? "#61892d" : 
                yearNum < currentYear ? "#686864" : "#969691");
            return {
                value: getDisplayValue(allTimeValues[year], isPastOrCurrent, maxAllTime),
                label: year.toString(),
                frontColor: type === "tomatoes" 
                  ? getTomatoColorByValue(allTimeValues[year], maxAllTime) 
                  : getPlantColorByValue(allTimeValues[year], maxAllTime),
                labelTextStyle: {
                    color: labelColor,
                    marginLeft: -6,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Anuphan-Medium",
                },
                topLabelComponent: () => (
                  <Text style={{
                      fontSize: 14,
                      fontFamily: "Anuphan-Regular",
                      color: "#686864",
                      marginBottom: 4,
                  }}>
                      {isPastOrCurrent ? allTimeValues[year] : ''}
                  </Text>
                )
            };
        });
    }
  };
  
  const getTimeRange = (timeFrame, offset = 0) => {
    const now = new Date();
    const offsetDate = new Date();

    switch (timeFrame) {
      case "today":
        offsetDate.setDate(now.getDate() + offset);
        return {
          start: new Date(offsetDate.setHours(0, 0, 0, 0)),
          end: new Date(offsetDate.setHours(23, 59, 59, 999)),
        };
      case "week":
        offsetDate.setDate(now.getDate() + offset * 7);
        const weekStart = new Date(offsetDate);
        weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return { start: weekStart, end: weekEnd };
      case "month":
        offsetDate.setMonth(now.getMonth() + offset);
        return {
          start: new Date(offsetDate.getFullYear(), offsetDate.getMonth(), 1),
          end: new Date(
            offsetDate.getFullYear(),
            offsetDate.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          ),
        };
      case "year":
        offsetDate.setFullYear(now.getFullYear() + offset);
        return {
          start: new Date(offsetDate.getFullYear(), 0, 1),
          end: new Date(offsetDate.getFullYear(), 11, 31, 23, 59, 59, 999),
        };
      default:
        return {
          start: new Date(now.getFullYear() - 4, 0, 1),
          end: now,
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
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Received data:", data);

      const filteredSessions = data.sessions?.filter((session) => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= timeRange.start && sessionDate <= timeRange.end;
      });

      const statsData = {
        ...data,
        sessions: filteredSessions,
      };

      setStats(statsData);
      setChartData(formatChartData(statsData, timeFrame, selectedType));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsChartLoading(false);
    }
  };

  const getFormattedStatsText = (type, count) => {
    const singular = type === "tomatoes" ? "tomato" : "plant";
    const plural = type === "tomatoes" ? "tomatoes" : "plants";
    return count === 1 ? singular : plural;
  };

  const getTimeFrameText = () => {
    switch (selectedTimeFrame) {
      case "today":
        return "today";
      case "week":
        return "this week";
      case "month":
        return "this month";
      case "year":
        return "this year";
      case "all time":
        return "";
      default:
        return "this year";
    }
  };

  const getFormattedDate = () => {
    const now = new Date();
    const offsetDate = new Date();
    switch (selectedTimeFrame) {
      case "today":
        offsetDate.setDate(now.getDate() + dateOffset);
        return offsetDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      case "week":
        offsetDate.setDate(now.getDate() + dateOffset * 7);
        const weekStart = new Date(offsetDate);
        weekStart.setDate(offsetDate.getDate() - offsetDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} – ${weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "month":
        offsetDate.setMonth(now.getMonth() + dateOffset);
        const lastDay = new Date(
          offsetDate.getFullYear(),
          offsetDate.getMonth() + 1,
          0
        ).getDate();
        return `${offsetDate.toLocaleDateString("en-US", {
          month: "short",
        })} 1 – ${lastDay}, ${offsetDate.getFullYear()}`;
      case "year":
        offsetDate.setFullYear(now.getFullYear() + dateOffset);
        return offsetDate.getFullYear().toString();
      case "all time":
        return "All Time";
      default:
        return "";
    }
  };

  const handlePrevious = () => {
    setDateOffset((prev) => prev - 1);
  };

  const handleNext = () => {
    if (dateOffset < 0) {
      setDateOffset((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (stats.sessions) {
      const newTotalMinutes = stats.sessions.reduce((total, session) => {
        return total + parseInt(session.duration);
      }, 0);
      setStats((prev) => ({ ...prev, totalMinutes: newTotalMinutes }));
    }
  }, [stats.sessions]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      if (FIREBASE_AUTH.currentUser) {
        try {
          await fetchStats(selectedTimeFrame, dateOffset);
        } catch (error) {
          console.error("Error loading stats:", error);
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
                onPress={() => setIsDropdownVisible(!isDropdownVisible)}
              >
                <Text style={styles.timeFont}>{selectedTimeFrame}</Text>
                <ChevronDown color="#535350" size={16} />
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
                        }}
                      >
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
          <View style={styles.switchFrame}>
              <View style={styles.switchBox}>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    selectedType === "tomatoes" && styles.selectedTomatoButton,
                  ]}
                  onPress={() => handleTypeChange("tomatoes")}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedType === "tomatoes" && styles.selectedButtonText,
                    ]}
                  >
                    tomatoes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    selectedType === "plants" && styles.selectedPlantButton,
                  ]}
                  onPress={() => handleTypeChange("plants")}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedType === "plants" && styles.selectedButtonText,
                      { paddingHorizontal: 12 },
                    ]}
                  >
                    plants
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dataFrame}>
                <Text
                  style={[
                    styles.dataNumber,
                    selectedType === "tomatoes" && styles.tomatoData,
                  ]}
                >
                  {loading
                    ? "..."
                    : selectedType === "tomatoes"
                    ? stats.tomatoes
                    : stats.plants}
                </Text>
                <Text style={styles.dataCaption}>
                  {`${getFormattedStatsText(
                    selectedType,
                    selectedType === "tomatoes" ? stats.tomatoes : stats.plants
                  )} grown ${getTimeFrameText()}`}
                </Text>
              </View>
            </View>
          <View style={styles.infoFrame}>
            <View style={styles.graphFrame}>
                <BarChart
                    data={chartData}
                    barWidth={
                        selectedTimeFrame === "today" ? 8.5 : 
                        selectedTimeFrame === "week" ? 30 : 
                        selectedTimeFrame === "month" ? 6.7 : 
                        selectedTimeFrame === "year" ? 16.85 :
                        selectedTimeFrame === "all time" ? 45 : 16
                    }
                    spacing={
                        selectedTimeFrame === "today" ? 4 : 
                        selectedTimeFrame === "week" ? 15 : 
                        selectedTimeFrame === "month" ? 3 : 
                        selectedTimeFrame === "all time" ? 20 : 8
                    }
                    labelWidth={
                        selectedTimeFrame === "today" ? 40 : 
                        selectedTimeFrame === "week" ? 35 : 
                        selectedTimeFrame === "month" ? 15 : 
                        selectedTimeFrame === "all time" ? 50 : 20
                    }
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    height={215}
                    noOfSections={(() => {
                      const maxValue = Math.max(...chartData.map(item => item.value));
                      const hasNonZeroValues = chartData.some(item => item.value > 0.1);
                      if (!hasNonZeroValues || maxValue === 1) return 1;
                      return 2;
                  })()}
                    showYAxisIndices={false}
                    width={343}
                    initialSpacing={0}
                    showFractionalValues={false}
                    yAxisLabelWidth={25}
                    barBorderRadius={
                    selectedTimeFrame === "today" ? 3 : 
                    selectedTimeFrame === "week" ? 5 : 
                    selectedTimeFrame === "month" ? 2 : 
                    selectedTimeFrame === "year" ? 4 : 
                    selectedTimeFrame === "all time" ? 5 : 4
                    }
                    disableScroll={true}
                    maxValue={(() => {
                      const values = chartData.map(item => item.value);
                      const maxValue = Math.max(...values);
                      if (maxValue <= 1) {
                          return 1;
                      }
                      const realValues = values.filter(v => v > 0.1);
                      const maxVal = Math.max(...realValues);
                      if (selectedTimeFrame === "week" || 
                          selectedTimeFrame === "year" || 
                          selectedTimeFrame === "all time") {
                          return maxVal * 1.036;
                      }
                      return maxVal;
                    })()}
                    yAxisTextStyle={{
                        fontSize: 14,
                        fontFamily: "Anuphan-Regular",
                        color: "#686864",
                    }}
                    formatYLabel={(label) => {
                      if (selectedTimeFrame === 'today' || selectedTimeFrame === 'month') {
                          const maxValue = Math.max(...chartData.map(item => item.value));
                          if (maxValue <= 1) {
                              return parseInt(label) === 1 ? '1' : 
                                     parseInt(label) === 0 ? '0' : '';
                          }
                          const floorMax = Math.floor(maxValue);
                          const middlePoint = Math.floor(floorMax/2);
                          if (parseInt(label) === floorMax) return floorMax.toString();
                          if (parseInt(label) === middlePoint) return middlePoint.toString();
                          if (parseInt(label) === 0) return '0';
                      }
                      return '';
                  }}
                />
                <View style={[styles.dateSwitch, selectedTimeFrame === "all time" && styles.dateSwitchAllTime]}>
                    {selectedTimeFrame !== "all time" && (
                        <TouchableOpacity onPress={handlePrevious}>
                            <ChevronLeft color="#686864" size={18} strokeWidth={2.5} />
                        </TouchableOpacity>
                    )}
                    <Text style={[styles.dateSwitchText, selectedTimeFrame === "all time" && styles.dateSwitchTextAllTime]}>
                        {getFormattedDate()}
                    </Text>
                    {selectedTimeFrame !== "all time" ? (
                        dateOffset < 0 ? (
                            <TouchableOpacity onPress={handleNext}>
                                <ChevronRight color="#686864" size={18} strokeWidth={2.5} />
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 18, height: 18 }} /> // Placeholder with same dimensions
                        )
                    ) : null}
                </View>
            </View>
          </View>
          <View style={styles.statsFrame}>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>
                  {selectedTimeFrame === "today"
                    ? "current daily streak"
                    : "longest daily streak"}
                </Text>
                <Text style={[styles.statNum]}>
                  {loading
                    ? "..."
                    : selectedTimeFrame === "today"
                    ? stats.currentStreak
                    : stats.streak}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>total duration</Text>
                <Text style={styles.statNum}>
                  {loading ? "..." : `${stats.totalMinutes} min`}
                </Text>
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
    justifyContent: "flex-start",
    gap: 28,
  },
  childFrame: {
    flex: 1,
    width: 343,
    gap: 36,
  },
  infoFrame: {
    gap: 30,
  },
  switchFrame: {
    gap: 20,
  },
  dataFrame: {
    flexDirection: "column",
    alignItems: "center",
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
    flexDirection: "row",
    backgroundColor: "#F3F0EA",
    alignSelf: "center",
    borderRadius: 14,
  },
  switchButton: {
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 10,
    width: 85,
  },
  selectedTomatoButton: {
    backgroundColor: "#F9D7D3",
  },
  selectedPlantButton: {
    backgroundColor: "#D6E7C1",
  },
  tomatoData: {
    color: "#a81f10",
  },
  selectedButtonText: {
    color: "#151514",
    fontWeight: "500",
    fontFamily: "Anuphan-Medium",
  },
  graphFrame: {
    gap: 8,
    height: 266,
    //overflow: 'hidden',
    width: "100%",
  },
  statsBoxFrame: {
    gap: 12,
    flexDirection: "row",
  },
  insightsFrame: {
    alignSelf: "stretch",
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  statsFrame: {
    gap: 12,
  },
  timeFrame: {
    borderRadius: 8,
    backgroundColor: "#f3f0ea",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 10,
    paddingTop: 3,
    paddingRight: 6,
    paddingBottom: 3,
    gap: 2,
  },
  timeFont: {
    fontSize: 14,
    fontWeight: "600",
    color: "#535350",
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 999,
  },
  dropdownParent: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#f3f0ea",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 8,
    shadowOpacity: 1,
    width: 129,
    zIndex: 1000,
    overflow: "hidden",
    borderRadius: 8,
  },
  dropdownChild: {
    width: "100%",
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
    width: "75%",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: "#F3F0EA",
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  subtitles: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Anuphan-SemiBold",
    color: "#151514",
    textAlign: "left",
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Anuphan-Regular",
    color: "#151514",
    textAlign: "center",
    width: "100%",
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
  buttonText: {
    fontSize: 14,
    fontFamily: "Anuphan-Regular",
    color: "#686864",
    textAlign: "left",
  },
  dateSwitch: {
    gap: 8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 150,
    justifyContent: 'center'
  },
  dateSwitchText: {
    fontSize: 14,
    fontFamily: "Anuphan-Regular",
    color: "#686864",
    textAlign: "center",
  },
  dateSwitchAllTime: {
    justifyContent: 'center',
    width: '100%',
  },
  dateSwitchTextAllTime: {
    textAlign: 'center'
  }
});

export default StatsScreen;
