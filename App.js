import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './app/screens/HomeScreen';
import FriendsScreen from './app/screens/FriendsScreen';
import StatsScreen from './app/screens/StatsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import TimerDurations from './app/screens/TimerDurations';
import WelcomeScreen from './app/screens/WelcomeScreen';
import SignUp from './app/screens/SignUp';
import Login from './app/screens/Login';
import EmailSignUp from './app/screens/EmailSignUp';
import Posts from './app/screens/PostsScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { TimerProvider } from './app/context/TimerContext';

const Stack = createNativeStackNavigator()

export default function App() {
  const [user, setUser] = useState(null);

  const [timerValues, setTimerValues] = useState({
      pomodoro: '25',
      shortBreak: '5',
      longBreak: '15'
  });

  const handleTimerUpdate = async (newValues) => {
      setTimerValues(newValues);
      try {
          await AsyncStorage.setItem('timerValues', JSON.stringify(newValues));
      } catch (error) {
          console.log('Error saving values:', error);
      }
  };

  useEffect(() => {
    const loadInitialValues = async () => {
        try {
            const savedValues = await AsyncStorage.getItem('timerValues');
            if (savedValues) {
                setTimerValues(JSON.parse(savedValues));
            }
        } catch (error) {
            console.log('Error loading initial values:', error);
        }
    };
    loadInitialValues();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
        setUser(user);
    });
    
    return unsubscribe;
  }, []);

  return (
    <TimerProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ animation: 'none' }}
          initialRouteName='Welcome'
        >
          {!user ? (
            <>
              <Stack.Screen 
                name='Welcome' 
                component={WelcomeScreen} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name='Login' 
                component={Login} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name='SignUp' 
                component={SignUp} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name='EmailSignUp' 
                component={EmailSignUp} 
                options={{ headerShown: false }} 
              />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                options={{ headerShown: false }}>
                {props => <HomeScreen {...props}
                timerValues={timerValues} />}
              </Stack.Screen> 
              <Stack.Screen 
                name="Friends" 
                component={FriendsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Posts" 
                component={Posts}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Stats" 
                component={StatsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Settings" 
                options={{ headerShown: false }}>
                {props => <SettingsScreen {...props} timerValues={timerValues} 
                onUpdate={handleTimerUpdate} />}
              </Stack.Screen>
              <Stack.Screen 
                name="TimerDurations" 
                component={TimerDurations}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </TimerProvider>
  );
}
