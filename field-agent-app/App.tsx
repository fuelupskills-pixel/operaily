import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { LeadsStackNavigator } from './src/navigation/LeadsStackNavigator';
import { WorkflowScreen } from './src/screens/WorkflowScreen';
import { VideoStudioScreen } from './src/screens/VideoStudioScreen';
import { StatusBar } from 'expo-status-bar';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Leads" component={LeadsStackNavigator} />
        <Tab.Screen name="Inbox" component={ConversationsScreen} />
        <Tab.Screen name="Studio" component={VideoStudioScreen} />
        <Tab.Screen name="Workflows" component={WorkflowScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
