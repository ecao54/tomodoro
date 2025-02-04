import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import InfoInput from './app/screens/InfoInput';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { TimerProvider } from './app/context/TimerContext';
import { useFonts } from 'expo-font';
import { API_URL } from './app/config/api';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'Anuphan-Regular': require('./app/assets/fonts/Anuphan-Regular.ttf'),
    'Anuphan-Medium': require('./app/assets/fonts/Anuphan-Medium.ttf'),
    'Anuphan-SemiBold': require('./app/assets/fonts/Anuphan-SemiBold.ttf'),
    'Anuphan-Bold': require('./app/assets/fonts/Anuphan-Bold.ttf'),
    'Anuphan-Light': require('./app/assets/fonts/Anuphan-Light.ttf'),
    'Anuphan-ExtraLight': require('./app/assets/fonts/Anuphan-ExtraLight.ttf'),
    'Anuphan-Thin': require('./app/assets/fonts/Anuphan-Thin.ttf'),
  });

  const checkProfile = async (user) => {
    try {
      console.log('Starting profile check...');
      const token = await user.getIdToken(true);
      
      const mongoResponse = await fetch(`${API_URL}/users/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
  
      if (!mongoResponse.ok) {
        console.log('MongoDB response not ok:', mongoResponse.status);
        setProfileComplete(false);
        return false;
      }
  
      const userData = await mongoResponse.json();
      console.log('User data from MongoDB:', userData);
  
      const isComplete = !!(
        userData.username && 
        userData.firstName && 
        userData.lastName
      );
  
      console.log('Profile complete:', isComplete);
      setProfileComplete(isComplete);
      return isComplete;
  
    } catch (error) {
      console.error('Profile check error:', error);
      setProfileComplete(false);
      return false;
    }
  };
  
  useEffect(() => {
    console.log('Auth state changed - Current user:', FIREBASE_AUTH.currentUser?.uid);
    
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      setIsLoading(true);
      if (user) {
        console.log('User authenticated:', user.uid);
        const isComplete = await checkProfile(user);
        console.log('Profile check complete:', isComplete);
      } else {
        console.log('No authenticated user');
        setProfileComplete(false);
      }
      setUser(user);
      setIsLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <TimerProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ animation: 'none' }}
          initialRouteName={user ? (profileComplete ? 'Home' : 'InfoInput') : 'Welcome'}
        >
          {!user ? (
            <>
              <Stack.Screen name='Welcome' component={WelcomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
              <Stack.Screen name='SignUp' component={SignUp} options={{ headerShown: false }} />
              <Stack.Screen name='EmailSignUp' component={EmailSignUp} options={{ headerShown: false }} />
            </>
          ) : !profileComplete ? (
            <Stack.Screen 
              name='InfoInput' 
              component={InfoInput}
              initialParams={{ onProfileUpdate: () => checkProfile(FIREBASE_AUTH.currentUser) }}
              options={{ headerShown: false, gestureEnabled: false }} 
            />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Posts" component={Posts} options={{ headerShown: false }} />
              <Stack.Screen name="Stats" component={StatsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="TimerDurations" component={TimerDurations} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </TimerProvider>
  );
}