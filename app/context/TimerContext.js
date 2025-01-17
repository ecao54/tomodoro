import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

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
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerValues, setTimerValues] = useState({
    pomodoro: '25',
    shortBreak: '5',
    longBreak: '15'
  });

  const POMODORO = parseInt(timerValues.pomodoro) * 60; // 25 minutes in seconds
  const SHORT_BREAK = parseInt(timerValues.shortBreak) * 60; // 5 minutes in seconds
  const LONG_BREAK = parseInt(timerValues.longBreak) * 60; // 15 minutes in seconds

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
            setTimeRemaining(SHORT_BREAK);
            setCycleCount(cycleCount + 1);
        } else {
            updateStats('plant');
            scheduleNotification('long break');
            setMode('long break');
            setTimeRemaining(LONG_BREAK);
            setCycleCount(0);
        }
    } else {
        scheduleNotification(mode);
        setMode('pomodoro');
        setTimeRemaining(POMODORO);
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
    setTimeRemaining(POMODORO);
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
  
  // Handle play
  useEffect(() => {
    let intervalId;
    if (isRunning) {
        intervalId = setInterval(() => {
            setTimeRemaining((prevSeconds) => {
                if (prevSeconds <= 0) {
                    clearInterval(intervalId);
                    handleModeSwitch();
                    return 0;
                } else {
                    return prevSeconds - 1;
                }
            });
        }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]); // Re-run effect when isRunning changes

  return (
    <TimerContext.Provider value={{
      cycleCount,
      mode,
      timeRemaining,
      isRunning,
      timerValues,
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