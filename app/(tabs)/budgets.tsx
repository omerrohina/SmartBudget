import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import JSONTree from 'react-native-json-tree';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Context from '../Context';

const API_BASE = 'http://localhost:3001/api';
const screenWidth = Dimensions.get('window').width - 32;

// TypeScript interface
interface Budgets {
  title?: string;
  amount?: number;
  //date?: Date;
  description?: string;
  [key: string]: any;
}

export default function GetCategoryAnalytics() {
  const [budgets, setBudgets] = useState<CategoryAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { count } = useContext(Context);

  useEffect(() => {
    fetchBudgets();
  }, [count]);

  // Fetch analytics data
  const fetchBudgets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/budget`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Budgets[] = await response.json();
        console.log('API response:', data);
        setBudgets(data);
      } else {
        Alert.alert('Error', 'Failed to fetch analytics data');
      }
    } catch (error) {
      Alert.alert('Error', 'Network or server issue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <ScrollView>
      <View>
        <JSONTree data={budgets} />
      </View>
      </ScrollView>

      );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
});
