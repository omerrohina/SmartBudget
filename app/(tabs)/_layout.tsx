import { Tabs } from 'expo-router';
import { Chrome as Home, CirclePlus as PlusCircle, ChartBar as BarChart3, User, ClipboardPenLine } from 'lucide-react-native';

import { CounterProvider } from '../Context';

export default function TabLayout() {
  return (
    <CounterProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb', 
        tabBarInactiveTintColor: '#94a3b8', 
        tabBarStyle: {
          backgroundColor: '#0f172a', 
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: 'Add Transaction',
          tabBarIcon: ({ size, color }) => (
            <PlusCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-budget"
        options={{
          title: 'Budgeting',
          tabBarIcon: ({ size, color }) => (
            <ClipboardPenLine size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </CounterProvider>
  );
}
