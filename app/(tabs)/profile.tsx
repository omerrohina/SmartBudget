import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Calendar, LogOut, Trash2, Settings } from 'lucide-react-native';

const API_BASE = 'http://localhost:3001/api';

//  unified confirmation for mobile + web
function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    confirmAction('Logout', 'Are you sure you want to logout?', async () => {
      try {
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/auth/login');
      } catch (error) {
        console.error('Logout error:', error);
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    });
  };

  const handleDeleteAccount = () => {
    confirmAction(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            Alert.alert('Error', 'You are not logged in.');
            return;
          }

          const response = await fetch(`${API_BASE}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            await AsyncStorage.multiRemove(['token', 'user']);
            Alert.alert('Success', 'Account deleted successfully');
            router.replace('/auth/login');
          } else {
            const errorData = await response.json();
            Alert.alert('Error', errorData.error || 'Failed to delete account');
          }
        } catch (error) {
          console.error('Delete account error:', error);
          Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={40} color="#2563eb" />
          </View>
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        {user.created_at && (
          <View style={styles.memberSince}>
            <Calendar size={16} color="#64748b" />
            <Text style={styles.memberText}>
              Member since {formatDate(user.created_at)}
            </Text>
          </View>
        )}
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Mail size={20} color="#64748b" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoItemBorder]}>
            <View style={styles.infoLeft}>
              <User size={20} color="#64748b" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        >
          <View style={styles.settingLeft}>
            <Settings size={20} color="#64748b" />
            <Text style={styles.settingText}>App Preferences</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <LogOut size={20} color="#dc2626" />
          <Text style={[styles.actionText, { color: '#dc2626' }]}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleDeleteAccount}
        >
          <Trash2 size={20} color="#dc2626" />
          <Text style={[styles.actionText, { color: '#dc2626' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.appName}>SmartBudget</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.copyright}>
          © 2025 SmartBudget. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  userCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberText: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    padding: 16,
  },
  infoItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  settingArrow: {
    fontSize: 24,
    color: '#94a3b8',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 40,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
