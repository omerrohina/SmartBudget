import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://localhost:3001/api';

export default function profile() {


return (

<ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Change your profile settings here</Text>
      </View>

<View style={styles.section}>
  <TouchableOpacity style={styles.Button}>
         <Text style={styles.ButtonText}>Change Password</Text>
  </TouchableOpacity>
</View>


<View style={styles.section}>
  <TouchableOpacity style={styles.Button}>
         <Text style={styles.ButtonText}>Change Theme</Text>
  </TouchableOpacity>
</View>


<View style={styles.section}>
  <TouchableOpacity style={styles.submitButton}>
         <Text style={styles.ButtonText}>Change Theme</Text>
  </TouchableOpacity>
</View>




</ScrollView>
);
}


const styles = StyleSheet.create({

container: {
    flex: 1,
    backgroundColor: '#0f172a',
},

header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1e293b',
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

section: {
    gap: 8,
  },

Button: {
    padding: 20,
    backgroundColor: '#2563eb',
    //borderRadius: 15,
  },
ButtonText: {
    color: '#f8fafc', 
    fontWeight: '500',
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
    backgroundColor: '#FF0000'
  },


});
