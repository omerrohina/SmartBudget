import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Context from '../Context';
import { Calendar, DollarSign, Tag, FileText } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_BASE = 'http://localhost:3001/api';

interface Budget {
  id: number | string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  remaining?: number;
}

/* ---- Format YYYY-MM-DD for display ---- */
const formatDateLocal = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function AddBudget() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateLocal(new Date()));
  const [showPicker, setShowPicker] = useState(false);
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
          date, // 💯 exact value saved
        }),
      });

      if (response.ok) {
        const created = await response.json();

        // 💡 Ensure bottom list recognizes it
        const normalized: Budget = {
          ...created,
          id: created.id ?? created._id ?? Date.now(),
          remaining: created.remaining ?? created.amount,
        };

        setBudgets((prev) => [...prev, normalized]);
        await fetchBudgets(); // 🔥 ensure consistent UI without refresh

        Alert.alert('Success', 'Budget created successfully');

        setTitle('');
        setAmount('');
        setDescription('');
        setDate(formatDateLocal(new Date()));
        increment();
        router.push('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to create budget');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  /* 📌 Calendar click handler for Mobile */
  const openPicker = () => setShowPicker(true);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Budget</Text>
        <Text style={styles.subtitle}>Add a budget to manage spending</Text>
      </View>

      {/* TITLE */}
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

      {/* AMOUNT */}
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

      {/* DESCRIPTION */}
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

      {/* DATE + CALENDAR */}
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>

        {/* WEB picker */}
        {Platform.OS === 'web' ? (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={() => {
                const input = document.getElementById('webBudgetDatePicker') as HTMLInputElement;
                if (input?.showPicker) input.showPicker();
                else input?.click();
              }}
            >
              <Calendar size={20} color="#f8fafc" style={styles.inputIcon} />
            </TouchableOpacity>

            <input
              id="webBudgetDatePicker"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 0,
                color: '#f8fafc',
                fontSize: 16,
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
          </View>
        ) : (
          // MOBILE
          <TouchableOpacity style={styles.inputContainer} onPress={openPicker}>
            <Calendar size={20} color="#f8fafc" style={styles.inputIcon} />
            <Text style={styles.textinput}>{date}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MOBILE PICKER UI */}
      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(formatDateLocal(selectedDate));
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Budget</Text>
      </TouchableOpacity>

      {/* LIST OF BUDGETS (unchanged) */}
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
                ${b.remaining?.toFixed(2) ?? b.amount.toFixed(2)} / ${b.amount.toFixed(2)} — {b.date}
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

/* ---- STYLES (unchanged) ---- */
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0f172a' },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: { color: '#f8fafc', fontSize: 16, marginBottom: 6, marginTop: 14, fontWeight: '600' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  budgetCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  budgetTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  budgetInfo: { color: '#94a3b8', marginTop: 4 },
  inputIcon: { marginRight: 12 },
  section: { gap: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textinput: { flex: 1, fontSize: 16, color: '#f8fafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#94a3b8' },
});

