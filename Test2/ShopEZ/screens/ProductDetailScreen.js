import React, {useState} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebase';
import { ref, get, set, update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const [qty, setQty] = useState(1);

  const saveLocalCart = async (uid, newCart) => {
    try { await AsyncStorage.setItem(`cart_${uid}`, JSON.stringify(newCart)); } catch(e) {}
  };

  const addToCart = async () => {
    const user = auth.currentUser;
    if (!user) { Alert.alert('Not signed in'); return; }
    const uid = user.uid;
    const itemRef = ref(db, `carts/${uid}/${product.id}`);

    try {
      const snap = await get(itemRef);
      if (snap.exists()) {
        const current = snap.val();
        const newQty = (current.quantity || 1) + qty;
        await update(itemRef, { quantity: newQty, product });
      } else {
        await set(itemRef, { quantity: qty, product });
      }
      const cartSnap = await get(ref(db, `carts/${uid}`));
      if (cartSnap.exists()) {
        await saveLocalCart(uid, cartSnap.val());
      }
      Alert.alert('Success', 'Added to cart');
    } catch (err) {
      try {
        const local = await AsyncStorage.getItem(`cart_${uid}`);
        const parsed = local ? JSON.parse(local) : {};
        parsed[product.id] = parsed[product.id] ? { ...parsed[product.id], quantity: parsed[product.id].quantity + qty } : { product, quantity: qty };
        await saveLocalCart(uid, parsed);
        Alert.alert('Success', 'Added to cart (offline)');
      } catch(e) {
        Alert.alert('Error', 'Failed to add to cart');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#001F3F" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Image source={{uri: product.image}} style={styles.productImage} resizeMode="contain" />
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>R {product.price}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => setQty(Math.max(1, qty-1))}
            >
              <Ionicons name="remove" size={20} color="#001F3F" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{qty}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => setQty(qty+1)}
            >
              <Ionicons name="add" size={20} color="#001F3F" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <Ionicons name="cart" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  backText: {
    color: '#001F3F',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500'
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#FFFFFF'
  },
  productInfo: {
    flex: 1,
    padding: 20
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 28
  },
  productDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 20
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F'
  },
  productCategory: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'capitalize',
    fontStyle: 'italic'
  },
  quantityContainer: {
    marginBottom: 30
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#001F3F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center'
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#001F3F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  }
});