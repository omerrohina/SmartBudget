import React, { useState, useEffect } from 'react';
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
import JSONTree from 'react-native-json-tree';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, DollarSign, Tag, FileText } from 'lucide-react-native';

const API_BASE = 'http://localhost:3001/api';

export default function AddTransaction() {
  const router = useRouter();
  const [catCounts, setCatCounts] = useState([]); //<Category[]>([]);

  useEffect(() => {
    fetchCatCounts();
  }); //, [type]);


  const fetchCatCounts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/transactions/analytics/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCatCounts(data);
        console.log("Data:");
        console.log(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch categories');
      console.log("Failed to fetch categories");
      console.log(error);
    }
  };

  return (
      <ScrollView>
      <View>
        <JSONTree data={catCounts} />
      </View>
    </ScrollView>
  );

}




