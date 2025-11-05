import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Context from '../Context';
import { Calendar, DollarSign, Tag, FileText} from 'lucide-react-native';



const API_BASE = 'http://localhost:3001/api';

interface Budget {
  id: number;
  title: string;
  amount: number;
  date: string;
  description?: string;
}

export default function AddTransaction() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const router = useRouter();
  const { count, increment } = useContext(Context);

  const fetchBudgets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/budget`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: Budget[] = await response.json();
        setBudgets(data);
      } else {
        console.error('Failed to fetch budgets');
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [count]);

  const handleSubmit = async () => {
    if (!title || !amount || !date) {
      Alert.alert('Error', 'Title, amount, and date are required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          description,
          date,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Budget created successfully');
        setTitle('');
        setAmount('');
        setDescription('');
        setDate('');
        fetchBudgets();
        increment();
      } else {
        const errData = await response.json();
        Alert.alert('Error', errData.error || 'Failed to create budget');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (

    <ScrollView contentContainerStyle={styles.container}>

   <View style={styles.header}>
        <Text style={styles.title}>Create New Budget</Text>
        <Text style={styles.subtitle}>Add a new budget to manage your income and expenses</Text>
      </View>



     <View style={styles.section}>
      <Text style={styles.label}>Title</Text>
	<View style={styles.inputContainer}>
	 <Tag size={20} color="#f8fafc" style={styles.inputIcon} />
      <TextInput
        style={styles.textinput}
        placeholder="e.g. Food Budget"
        placeholderTextColor="#64748b"
        value={title}
        onChangeText={setTitle}
      />
	</View>
     </View>


     <View style={styles.section}>
        <Text style={styles.label}>Amount</Text>
	 <View style={styles.inputContainer}>
	<DollarSign size={20} color="#f8fafc" style={styles.inputIcon} />
      <TextInput
        style={styles.textinput}
        placeholder="0.00"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
	 </View>
     </View>


     <View style={styles.section}>
       <Text style={styles.label}>Description (optional)</Text>
	<View style={styles.inputContainer}>
	 <FileText size={20} color="#f8fafc" style={styles.inputIcon} />
      <TextInput
        style={styles.textinput}
        placeholder="Add a note..."
        placeholderTextColor="#64748b"
        value={description}
        onChangeText={setDescription}
      />
	</View>
     </View>


     <View style={styles.section}>
      <Text style={styles.label}>Date</Text>
        <View style={styles.inputContainer}>
         <Calendar size={20} color="#f8fafc" style={styles.inputIcon} />
      <TextInput
        style={styles.textinput}
        placeholder="MM-DD-YYYY"
        placeholderTextColor="#64748b"
        value={date}
        onChangeText={setDate}
      />
        </View>
     </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Budget</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 40 }}>
        <Text style={styles.label}>Your Budgets:</Text>
        {budgets.length === 0 ? (
          <Text style={{ color: '#94a3b8', marginTop: 8 }}>
            You haven’t created any budgets yet.
          </Text>
        ) : (
          budgets.map((b) => (
            <View key={b.id} style={styles.budgetCard}>
              <Text style={styles.budgetTitle}>{b.title}</Text>
              <Text style={styles.budgetInfo}>
                ${b.remaining.toFixed(2)} / ${b.amount.toFixed(2)} — {b.date}
              </Text>
              {b.description ? (
                <Text style={styles.budgetInfo}>{b.description}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',

  },
  label: {
    color: '#f8fafc',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600' as const, 
  },
  budgetCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  budgetTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  budgetInfo: {
    color: '#94a3b8',
    marginTop: 4,
  },

inputIcon: {
    marginRight: 12,
    color: '#f8fafc',
  },

section: {
    gap: 8,
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

textinput: {
    flex: 1,
    fontSize: 16,
    color: '#f8fafc',
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


});
