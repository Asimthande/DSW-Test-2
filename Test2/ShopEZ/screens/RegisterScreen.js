import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!fullName || !email || !password) { 
      setError('Please fill in all fields'); 
      return; 
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, `carts/${userCred.user.uid}`), {});
      await set(ref(db, `users/${userCred.user.uid}/profile`), {
        fullName: fullName,
        email: email,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopEZ</Text>
      <Text style={styles.subtitle}>Create Account</Text>
      
      <TextInput 
        placeholder="Full Name" 
        placeholderTextColor="#666"
        value={fullName} 
        onChangeText={setFullName} 
        style={styles.input} 
        autoCapitalize="words"
      />
      <TextInput 
        placeholder="Email" 
        placeholderTextColor="#666"
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        keyboardType="email-address" 
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Password" 
        placeholderTextColor="#666"
        value={password} 
        onChangeText={setPassword} 
        style={styles.input} 
        secureTextEntry
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20, 
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 32, 
    fontWeight: 'bold',
    marginBottom: 8, 
    textAlign: 'center',
    color: '#001F3F'
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30, 
    textAlign: 'center',
    color: '#000000'
  },
  input: {
    borderWidth: 1, 
    borderColor: '#001F3F',
    padding: 15, 
    marginBottom: 15, 
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    fontSize: 16
  },
  error: {
    color: '#FF0000', 
    marginBottom: 15,
    textAlign: 'center'
  },
  registerButton: {
    backgroundColor: '#001F3F',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  registerButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginLink: {
    color: '#001F3F',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline'
  }
});