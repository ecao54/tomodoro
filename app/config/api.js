import { Platform } from 'react-native';

const getApiUrl = () => {
    if (Platform.OS === 'ios') {
        // For iOS Simulator
        return 'http://127.0.0.1:5000/api';
        // For physical iOS device
        // return 'http://10.0.0.112:5000/api'; // Use your computer's IP address
    } else if (Platform.OS === 'android') {
        // For Android Emulator
        return 'http://10.0.2.2:5000/api';
    }
    return 'http://127.0.0.1:5000/api';
};

export const API_URL = getApiUrl();
