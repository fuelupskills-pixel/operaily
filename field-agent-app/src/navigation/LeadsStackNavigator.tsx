import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LeadsScreen } from '../screens/LeadsScreen';
import { LeadDetailScreen } from '../screens/LeadDetailScreen';

const Stack = createNativeStackNavigator();

export function LeadsStackNavigator() {
  return (
    <Stack.Navigator id="LeadsStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
      <Stack.Screen name="LeadsList" component={LeadsScreen} />
      <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
    </Stack.Navigator>
  );
}
