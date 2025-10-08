import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ShopEZHeader() {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>ShopEZ</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({route}) => ({
        headerShown: true,
        header: () => <ShopEZHeader />,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#CCCCCC',
        tabBarActiveBackgroundColor: '#001F3F', 
        tabBarInactiveBackgroundColor: '#001F3F', 
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Products') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen 
        name="Products" 
        component={ProductListScreen}
        options={{ 
          title: 'Products'
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ 
          title: 'My Cart'
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#001F3F" />
        <Text style={styles.loadingText}>ShopEZ</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: styles.stackHeader,
            headerTintColor: '#FFFFFF',
            headerTitleStyle: styles.stackHeaderTitle,
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ 
              headerShown: false,
              title: 'ShopEZ'
            }} 
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen} 
            options={{ 
              title: 'Product Details',
              headerBackTitle: 'Back'
            }} 
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: true,
            headerStyle: styles.stackHeader,
            headerTintColor: '#FFFFFF',
            headerTitleStyle: styles.stackHeaderTitle,
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              title: 'ShopEZ - Login',
              headerTitleAlign: 'center'
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: 'ShopEZ - Register',
              headerTitleAlign: 'center'
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginTop: 16,
  },
  headerContainer: {
    backgroundColor: '#001F3F', // Navy
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#001F3F', // Navy
    borderTopColor: '#000000',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  stackHeader: {
    backgroundColor: '#001F3F', // Navy
  },
  stackHeaderTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});