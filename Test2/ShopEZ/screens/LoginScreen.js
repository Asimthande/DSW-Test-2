import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Enter email and password'); return; }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopEZ</Text>
      <Text style={styles.subtitle}>Welcome Back</Text>
      
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
      
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Don't have an account? Register</Text>
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
  loginButton: {
    backgroundColor: '#001F3F',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  loginButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  registerLink: {
    color: '#001F3F',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline'
  }
});