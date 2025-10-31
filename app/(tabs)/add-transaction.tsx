import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { Calendar, DollarSign, Tag, FileText } from 'lucide-react-native';
import Context from '../Context';

const API_BASE = 'http://localhost:3001/api';

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

interface Budget {
  id: number;
  title: string;
  amount: number;
}

export default function AddTransaction() {
  const router = useRouter();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [budgetId, setBudgetId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { increment } = useContext(Context);

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, [type]);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/categories?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch categories');
    }
  };

  const fetchBudgets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/budget`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
        // no default budget selected by design
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch budgets');
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          category_id: categoryId,
          budget_id: budgetId, // include selected budget if any
          description,
          date,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Transaction added successfully');
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategoryId(categories.length > 0 ? categories[0].id : null);
        setBudgetId(null);
        increment();
        router.push('/(tabs)');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to add transaction');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Add Transaction</Text>
        <Text style={styles.subtitle}>Track your income and expenses</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>

        {/* Transaction Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputContainer}>
            <DollarSign size={20} color="#f8fafc" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.inputContainer}>
            <Tag size={20} color="#f8fafc" style={styles.inputIcon} />
            <RNPickerSelect
              onValueChange={(value) => setCategoryId(value)}
              value={categoryId}
              placeholder={{ label: 'Select a category', value: null, color: '#94a3b8' }}
              items={categories.map(c => ({ label: c.name, value: c.id }))}
              style={{
                inputIOS: styles.picker,
                inputAndroid: styles.picker,
                placeholder: { color: '#94a3b8' },
              }}
              useNativeAndroidPickerStyle={false}
            />
          </View>
        </View>

        {/* Budget (Improved Section) */}
        {type === 'expense' && (
        <View style={[styles.section, styles.budgetSection]}>
          <Text style={styles.label}>Budget (Optional)</Text>
          <View style={[styles.inputContainer, styles.budgetContainer]}>
            <Tag size={20} color="#f8fafc" style={styles.inputIcon} />
            <RNPickerSelect
              onValueChange={(value) => setBudgetId(value)}
              value={budgetId}
              placeholder={{
                label: 'No budget selected',
                value: null,
                color: '#64748b',
              }}
              items={budgets.map((b) => ({
                label: b.title,
                value: b.id,
              }))}
              style={{
                inputIOS: styles.picker,
                inputAndroid: styles.picker,
                placeholder: { color: '#64748b' },
              }}
              useNativeAndroidPickerStyle={false}
            />
          </View>
        </View>
        )}
        
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#f8fafc" style={styles.inputIcon} />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <View style={styles.inputContainer}>
            <FileText size={20} color="#f8fafc" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a note..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: type === 'income' ? '#10b981' : '#ef4444' },
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </Text>
        </TouchableOpacity>

      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  form: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  typeTextActive: {
    color: '#f8fafc',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
    color: '#f8fafc',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#f8fafc',
  },
  picker: {
    flex: 1,
    color: '#f8fafc',
    height: 40,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#f8fafc',
    paddingVertical: 4,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtonPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  modalButtonTextPrimary: {
    color: '#f8fafc',
  },
  budgetSection: {
    borderTopWidth: 1,
    borderColor: '#334155',
    paddingTop: 12,
    marginTop: 8,
  },
  budgetContainer: {
    borderColor: '#334155', 
  },
  helperText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginLeft: 4,
  },
});
