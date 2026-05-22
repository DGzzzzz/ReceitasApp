import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {useAuth} from '../contexts/AuthContext';
import {AuthNavigator} from './AuthNavigator';
import {AppNavigator} from './AppNavigator';
import {LoadingSpinner} from '../components/LoadingSpinner';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {session, loading} = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
        {session ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
