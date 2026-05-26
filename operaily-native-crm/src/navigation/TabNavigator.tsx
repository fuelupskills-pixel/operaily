import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LeadsStackNavigator } from './LeadsStackNavigator';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { VideoStudioScreen } from '../screens/VideoStudioScreen';
import { WorkflowScreen } from '../screens/WorkflowScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ConversationsScreen } from '../screens/ConversationsScreen';
import { HunterScreen } from '../screens/HunterScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="LeadsTab" component={LeadsStackNavigator} options={{ title: 'Leads' }} />
      <Tab.Screen name="HunterTab" component={HunterScreen} options={{ title: 'Hunter 🎯' }} />
      <Tab.Screen name="InboxTab" component={ConversationsScreen} options={{ title: 'Inbox' }} />
      <Tab.Screen name="InvoicesTab" component={InvoicesScreen} options={{ title: 'Invoices' }} />
      <Tab.Screen name="StudioTab" component={VideoStudioScreen} options={{ title: 'Studio' }} />
      <Tab.Screen name="WorkflowTab" component={WorkflowScreen} options={{ title: 'Workflows' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
