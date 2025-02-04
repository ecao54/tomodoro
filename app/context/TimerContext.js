import React, { createContext, useContext, useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { API_URL } from "../config/api";

const TimerContext = createContext();

const DEFAULT_TIMER_VALUES = {
  pomodoro: "25",
  shortBreak: "5",
  longBreak: "15"
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function TimerProvider({ children }) {
  const [profileComplete, setProfileComplete] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [mode, setMode] = useState("pomodoro");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timerValues, setTimerValues] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const resetState = () => {
    setTimerValues(DEFAULT_TIMER_VALUES);
    setTimeRemaining(convertToSeconds(DEFAULT_TIMER_VALUES.pomodoro));
    setMode("pomodoro");
    setCycleCount(0);
    setIsRunning(false);
    setProfileComplete(false);
    setIsLoading(true);
    setSettingsLoaded(false);
  };

  const convertToSeconds = (minutes) => {
    return parseInt(minutes) * 60;
  };

  const validateTimerValue = (value, defaultValue) => {
    const parsed = parseInt(value);
    return (!isNaN(parsed) && parsed >= 0) ? parsed : parseInt(defaultValue);
  };

  useEffect(() => {
    if (!timerValues) return;
    
    let duration;
    switch (mode) {
      case 'pomodoro':
        duration = timerValues.pomodoro;
        break;
      case 'short break':
        duration = timerValues.shortBreak;
        break;
      case 'long break':
        duration = timerValues.longBreak;
        break;
    }
    
    console.log(`Setting timer for ${mode}: ${duration} minutes`);
    setTimeRemaining(convertToSeconds(duration));
  }, [mode, timerValues]);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      resetState();

      if (user) {
        const profileResponse = await fetch(
          `${API_URL}/users/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
              Accept: "application/json",
            },
          }
        );
  
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          if (profile.settings?.timerValues) {
            console.log('Loading timer values:', profile.settings.timerValues);
            setTimerValues(profile.settings.timerValues);
          }
        }
      }
      setSettingsLoaded(true);
      setIsLoading(false);
    });
  
    return () => {
      unsubscribe();
      resetState();
    };
  }, []);

  const fetchUserSettings = async (user) => {
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      console.log("Fetching settings for:", user.uid);
      const response = await fetch(`${API_URL}/users/${user.uid}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Settings data:", data);
        if (data.settings?.timerValues) {
          setTimerValues(data.settings.timerValues);
          setTimeRemaining(parseInt(data.settings.timerValues.pomodoro) * 60);
        }
      }
    } catch (error) {
      console.error("Settings fetch error:", error);
    } finally {
      setIsLoading(false);
      setSettingsLoaded(true);
    }
  };

  // Move timer logic here
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevSeconds) => {
          if (prevSeconds <= 0) {
            clearInterval(intervalId);
            handleModeSwitch();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const updateTimerValues = async (newValues) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/users/${user.uid}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: {
            timerValues: newValues
          }
        })
      });

      if (response.ok) {
        setTimerValues(newValues);
        setTimeRemaining(parseInt(newValues.pomodoro) * 60);
        setMode('pomodoro');
        setCycleCount(0);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Error updating timer values:', error);
    }
  };


  const handleModeSwitch = () => {
    console.log('Mode switch - current values:', timerValues);
    
    if (mode === "pomodoro") {
      updateStats("tomato");
      if (cycleCount < 3) {
        setMode("short break");
        setCycleCount(prev => prev + 1);
      } else {
        updateStats("plant");
        setMode("long break");
        setCycleCount(0);
      }
    } else {
      setMode("pomodoro");
    }
    setIsRunning(false);
  };

  const handlePlay = () => {
    if (!isRunning) {
      setIsRunning(true);
    } else {
      handleRestart();
    }
  };

  const handleRestart = () => {
    setMode("pomodoro");
    setCycleCount(0);
    setIsRunning(false);
  };

  const updateStats = async (sessionType) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        console.log("No user logged in");
        return;
      }

      const token = await user.getIdToken();
      console.log("Making request to:", `${API_URL}/stats/update`);

      const response = await fetch(`${API_URL}/stats/update`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          sessionType: sessionType,
          duration: parseInt(timerValues.pomodoro),
          settings: {
            pomodoro: timerValues.pomodoro,
            shortBreak: timerValues.shortBreak,
            longBreak: timerValues.longBreak,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Stats updated successfully:", data);
    } catch (error) {
      console.error("Error updating stats:", {
        message: error.message,
        stack: error.stack,
        url: `${API_URL}/stats/update`,
      });
    }
  };

  const scheduleNotification = async (mode) => {
    try {
      let message;
      switch (mode) {
        case "pomodoro":
          message = "Time's up! Let's take a short break";
          break;
        case "short break":
          message = "Break's over! Back to work";
          break;
        case "long break":
          message = "Long break finished! Ready to start fresh?";
          break;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Tomodoro",
          body: message,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("Notification permissions not granted");
        }
      } catch (error) {
        console.error("Error requesting notification permissions:", error);
      }
    };

    requestPermissions();
  }, []);

  return (
    <TimerContext.Provider
      value={{
        cycleCount,
        mode,
        timeRemaining,
        isRunning,
        timerValues,
        isLoading,
        settingsLoaded,
        profileComplete,
        handlePlay,
        handleRestart,
        handleModeSwitch,
        updateTimerValues,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);
