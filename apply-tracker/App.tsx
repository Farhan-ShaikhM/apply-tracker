import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApplicationsProvider } from './src/context/ApplicationsContext';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <ApplicationsProvider>
        <HomeScreen />
        <StatusBar style="dark" />
      </ApplicationsProvider>
    </SafeAreaProvider>
  );
}
