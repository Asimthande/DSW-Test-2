import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../firebase';
import { ref, onValue, update, remove, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen({ navigation }) { // Add navigation prop
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const uid = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const loadInitialCart = async () => {
      try {
        const local = await AsyncStorage.getItem(`cart_${uid}`);
        if (local) {
          setCart(JSON.parse(local));
        }
      } catch (e) {
        console.log('Failed to load local cart');
      }
    };

    loadInitialCart();

    const cartRef = ref(db, `carts/${uid}`);
    const unsub = onValue(cartRef, async (snapshot) => {
      setSyncing(true);
      if (snapshot.exists()) {
        const val = snapshot.val();
        setCart(val);
        try { 
          await AsyncStorage.setItem(`cart_${uid}`, JSON.stringify(val)); 
        } catch(e) {
          console.log('Failed to save cart locally');
        }
      } else {
        setCart({});
        try { 
          await AsyncStorage.setItem(`cart_${uid}`, JSON.stringify({})); 
        } catch(e) {
          console.log('Failed to save empty cart locally');
        }
      }
      setLoading(false);
      setSyncing(false);
    }, async (error) => {
      console.log('Firebase connection failed, using local data');
      const local = await AsyncStorage.getItem(`cart_${uid}`);
      if (local) setCart(JSON.parse(local));
      setLoading(false);
      setSyncing(false);
    });

    return () => unsub();
  }, [uid]);

  const changeQty = async (productId, newQty) => {
    if (!uid) return;
    if (newQty <= 0) {
      await removeItem(productId);
      return;
    }
    
    setSyncing(true);
    try {
      await update(ref(db, `carts/${uid}/${productId}`), { quantity: newQty });
    } catch (err) {
      try {
        const local = await AsyncStorage.getItem(`cart_${uid}`);
        const parsed = local ? JSON.parse(local) : {};
        if (parsed[productId]) {
          parsed[productId].quantity = newQty;
          await AsyncStorage.setItem(`cart_${uid}`, JSON.stringify(parsed));
          setCart(parsed);
        }
        Alert.alert('Updated (offline)', 'Cart updated in offline mode');
      } catch(e) {
        Alert.alert('Error', 'Failed to update cart');
      }
    } finally {
      setSyncing(false);
    }
  };

  const removeItem = async (productId) => {
    if (!uid) return;
    
    setSyncing(true);
    try {
      await remove(ref(db, `carts/${uid}/${productId}`));
    } catch (err) {
      try {
        const local = await AsyncStorage.getItem(`cart_${uid}`);
        const parsed = local ? JSON.parse(local) : {};
        delete parsed[productId];
        await AsyncStorage.setItem(`cart_${uid}`, JSON.stringify(parsed));
        setCart(parsed);
        Alert.alert('Removed (offline)', 'Item removed in offline mode');
      } catch(e) {
        Alert.alert('Error', 'Failed to remove item');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await signOut(auth);
              // Navigation is handled automatically by the auth state change in App.js
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const items = Object.keys(cart || {}).map(key => ({ id: key, ...cart[key] }));
  const total = items.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0);

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#001F3F" />
      <Text style={styles.loadingText}>Loading Cart...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.headerActions}>
          {syncing && <ActivityIndicator size="small" color="#001F3F" style={styles.syncIndicator} />}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#001F3F" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#001F3F" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some products to get started</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.listContent}
            renderItem={({item}) => (
              <View style={styles.cartItem}>
                <Image source={{uri: item.product.image}} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.product.title}</Text>
                  <Text style={styles.itemPrice}>R {item.product.price.toFixed(2)}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      onPress={() => changeQty(item.id, (item.quantity||1)-1)} 
                      style={styles.quantityButton}
                      disabled={syncing}
                    >
                      <Ionicons name="remove" size={16} color="#001F3F" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity || 1}</Text>
                    <TouchableOpacity 
                      onPress={() => changeQty(item.id, (item.quantity||1)+1)} 
                      style={styles.quantityButton}
                      disabled={syncing}
                    >
                      <Ionicons name="add" size={16} color="#001F3F" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => removeItem(item.id)} 
                      style={styles.removeButton}
                      disabled={syncing}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FF0000" />
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemTotal}>
                    Subtotal: R {((item.product.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          />
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>R {total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 10,
    color: '#001F3F',
    fontSize: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  syncIndicator: {
    marginRight: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#001F3F',
    borderRadius: 6
  },
  logoutText: {
    color: '#001F3F',
    marginLeft: 4,
    fontWeight: '500'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F3F',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center'
  },
  listContent: {
    padding: 15
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 20,
    marginBottom: 4
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 8
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#001F3F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center'
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    padding: 6
  },
  removeText: {
    color: '#FF0000',
    marginLeft: 4,
    fontSize: 14
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000'
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    backgroundColor: '#FFFFFF'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000'
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#001F3F'
  },
  checkoutButton: {
    backgroundColor: '#001F3F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});