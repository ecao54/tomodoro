import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { API_URL } from '../config/api';

const TimerContext = createContext();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export function TimerProvider({ children }) {
  const [cycleCount, setCycleCount] = useState(0);
  const [mode, setMode] = useState('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerValues, setTimerValues] = useState({
    pomodoro: '25',
    shortBreak: '5',
    longBreak: '15'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const convertToSeconds = (minutes) => { 
    return parseInt(minutes) * 60;
  }

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchUserSettings(user);
      } else {
        // Reset to defaults when no user/logout
        setTimerValues({
          pomodoro: '25',
          shortBreak: '5',
          longBreak: '15'
        });
        setTimeRemaining(25 * 60);
      }
      setSettingsLoaded(true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserSettings = async (user) => {
    try {
        console.log('Fetching user settings...');
        const token = await user.getIdToken();
        console.log('Got token, making API request...');
        
        const url = `${API_URL}/users/${user.uid}/settings`;
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Raw response data:', data);
            
            if (data.settings?.timerValues) {
                const newValues = data.settings.timerValues;
                setTimerValues(newValues);
                const newPomodoro = parseInt(newValues.pomodoro) * 60;
                setTimeRemaining(newPomodoro);
                console.log('Updated time remaining:', newPomodoro);
            } else {
                console.log('No timer values in response');
            }
        } else {
            console.error('Response not OK:', await response.text());
        }
    } catch (error) {
        console.error('Error in fetchUserSettings:', error);
        console.error('Error stack:', error.stack);
    } finally {
        setSettingsLoaded(true);
        setIsLoading(false);
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

  // Update timeRemaining when timerValues change
  useEffect(() => {
    if (mode === 'pomodoro') {
      setTimeRemaining(parseInt(timerValues.pomodoro) * 60);
    } else if (mode === 'short break') {
      setTimeRemaining(parseInt(timerValues.shortBreak) * 60);
    } else if (mode === 'long break') {
      setTimeRemaining(parseInt(timerValues.longBreak) * 60);
    }
  }, [timerValues, mode]);

  // Add updateTimerValues function
  const updateTimerValues = (newValues) => {
    setTimerValues(newValues);
    setIsRunning(false); // Stop timer when values change
  };

  // Move all handler functions here
  const handleModeSwitch = () => {
    if (mode === 'pomodoro') {
        updateStats('tomato');
        scheduleNotification('pomodoro');
        if (cycleCount < 3) {
            setMode('short break');
            setTimeRemaining(convertToSeconds(timerValues.shortBreak));
            setCycleCount(cycleCount + 1);
        } else {
            updateStats('plant');
            scheduleNotification('long break');
            setMode('long break');
            setTimeRemaining(convertToSeconds(timerValues.longBreak));
            setCycleCount(0);
        }
    } else {
        scheduleNotification(mode);
        setMode('pomodoro');
        setTimeRemaining(convertToSeconds(timerValues.pomodoro));
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
    setMode('pomodoro');
    setTimeRemaining(convertToSeconds(timerValues.pomodoro));
    setCycleCount(0);
    setIsRunning(false);
  };

  const updateStats = async (sessionType) => {
      try {
          const user = FIREBASE_AUTH.currentUser;
          if (!user) {
              console.log('No user logged in');
              return;
          }
  
          const token = await user.getIdToken();
          console.log('Making request to:', `${API_URL}/stats/update`);

          const response = await fetch(`${API_URL}/stats/update`, {
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  userId: user.uid,
                  sessionType: sessionType,
                  duration: parseInt(timerValues.pomodoro),
                  settings: {
                      pomodoro: timerValues.pomodoro,
                      shortBreak: timerValues.shortBreak,
                      longBreak: timerValues.longBreak
                  }
              })
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          console.log('Stats updated successfully:', data);
      } catch (error) {
          console.error('Error updating stats:', {
              message: error.message,
              stack: error.stack,
              url: `${API_URL}/stats/update`
          });
      }
  };

  const scheduleNotification = async (mode) => {
      try {
          let message;
          switch(mode) {
              case 'pomodoro':
                  message = "Time's up! Let's take a short break";
                  break;
              case 'short break':
                  message = "Break's over! Back to work";
                  break;
              case 'long break':
                  message = "Long break finished! Ready to start fresh?";
                  break;
          }
  
          await Notifications.scheduleNotificationAsync({
              content: {
                  title: 'Tomodoro',
                  body: message,
                  sound: true,
              },
              trigger: null,
          });
      } catch (error) {
          console.error('Error scheduling notification:', error);
      }
  };

  useEffect(() => {
    const requestPermissions = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted');
            }
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
        }
    };

    requestPermissions();
  }, []);

  return (
    <TimerContext.Provider value={{
      cycleCount,
      mode,
      timeRemaining,
      isRunning,
      timerValues,
      isLoading,
      settingsLoaded,
      handlePlay,
      handleRestart,
      handleModeSwitch,
      updateTimerValues
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);