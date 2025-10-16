import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

const API_BASE = 'http://localhost:3001/api';
const screenWidth = Dimensions.get('window').width - 32;

// TypeScript interface
interface CategoryAnalytics {
  name?: string;
  category?: string;
  type?: 'expense' | 'income' | string;
  amount?: number;
  total?: number;
  categoryType?: string;
  [key: string]: any;
}

// Category colors mapping
const categoryColors: { [key: string]: { type: 'income' | 'expense'; color: string } } = {
  'salary': { type: 'income', color: '#9dc14aff' },
  'freelance': { type: 'income', color: '#524695ff' },
  'investment': { type: 'income', color: '#044842ff' },
  'other income': { type: 'income', color: '#10b981' },
  'food & dining': { type: 'expense', color: '#dc2626' },
  'transportation': { type: 'expense', color: '#ea580c' },
  'shopping': { type: 'expense', color: '#1bb123ff' },
  'entertainment': { type: 'expense', color: '#7c3aed' },
  'bills & utilities': { type: 'expense', color: '#2563eb' },
  'healthcare': { type: 'expense', color: '#db2777' },
  'education': { type: 'expense', color: '#0891b2' },
  'other expense': { type: 'expense', color: '#64748b' },
};

export default function GetCategoryAnalytics() {
  const [catCounts, setCatCounts] = useState<CategoryAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatCounts();
  }, []);

  // Fetch analytics data
  const fetchCatCounts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/transactions/analytics/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: CategoryAnalytics[] = await response.json();
        console.log('API response:', data);
        setCatCounts(data);
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

  // Normalize data and assign colors
  const normalizeData = (item: CategoryAnalytics) => {
    const nameRaw = (item.category ?? item.name ?? '').toString().toLowerCase();
    const colorEntry = categoryColors[nameRaw];

    // Default to expense if not in the map
    const type: 'income' | 'expense' = colorEntry?.type ?? 'expense';
    const color: string = colorEntry?.color ?? '#94a3b8'; // fallback color

    return {
      name: item.category ?? item.name ?? 'Unknown',
      type,
      amount: Number(item.total ?? item.amount ?? item.value ?? 0),
      color,
    };
  };

  const normalizedData = catCounts.map(normalizeData);

  // Split into expenses and income
  const expenses = normalizedData.filter(c => c.type === 'expense' && c.amount > 0);
  const income = normalizedData.filter(c => c.type === 'income' && c.amount > 0);

  // Debugging output
  console.log('Normalized Data:', normalizedData);
  console.log('Expenses:', expenses);
  console.log('Income:', income);

  const expenseChartData = expenses.map((item) => ({
    name: item.name,
    amount: item.amount,
    color: item.color,
    legendFontColor: '#f8fafc',
    legendFontSize: 14,
  }));

  const incomeChartData = income.map((item) => ({
    name: item.name,
    amount: item.amount,
    color: item.color,
    legendFontColor: '#f8fafc',
    legendFontSize: 14,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Category Analytics</Text>

      {loading ? (
        <View style={[styles.centered, { marginTop: 50 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : (
        <>
          {/* Expenses Section */}
          <Card style={styles.summaryCard}>
            <Card.Title title="Expenses Breakdown" titleStyle={styles.summaryTitle} />
            {expenseChartData.length > 0 ? (
              <PieChart
                data={expenseChartData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[5, 0]}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No expense data available</Text>
              </View>
            )}
          </Card>

          {/* Income Section */}
          <Card style={styles.summaryCard}>
            <Card.Title title="Income Breakdown" titleStyle={styles.summaryTitle} />
            {incomeChartData.length > 0 ? (
              <PieChart
                data={incomeChartData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[5, 0]}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No income data available</Text>
              </View>
            )}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

// Chart configuration
const chartConfig = {
  backgroundGradientFrom: '#0f172a',
  backgroundGradientTo: '#0f172a',
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
  decimalPlaces: 0,
};

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
