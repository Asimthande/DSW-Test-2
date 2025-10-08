import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  const [error, setError] = useState('');

  const fetchProducts = async (selected = 'all') => {
    setLoading(true); setError('');
    try {
      const url = selected === 'all' ? 'https://fakestoreapi.com/products' : `https://fakestoreapi.com/products/category/${selected}`;
      const res = await axios.get(url);
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get('https://fakestoreapi.com/products/categories');
        setCategories(['all', ...res.data]);
      } catch(e) {}
      fetchProducts();
    };
    getData();
  }, []);

  useEffect(() => fetchProducts(cat), [cat]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#001F3F" />
      <Text style={styles.loadingText}>Loading Products...</Text>
    </View>
  );
  
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts(cat)}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Products</Text>
      
      <View style={styles.catRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({item}) => (
            <TouchableOpacity 
              onPress={() => setCat(item)} 
              style={[
                styles.catBtn, 
                cat === item && styles.catActive
              ]}
            >
              <Text style={[
                styles.catText,
                cat === item && styles.catActiveText
              ]}>
                {item.replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        contentContainerStyle={styles.productList}
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('ProductDetail', { product: item })} 
            style={styles.card}
          >
            <Image source={{uri: item.image}} style={styles.img} resizeMode="contain" />
            <View style={styles.productInfo}>
              <Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productPrice}>R {item.price}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 10,
    color: '#001F3F',
    fontSize: 16
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    marginBottom: 15
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  catRow: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#001F3F',
    borderRadius: 20,
    backgroundColor: '#FFFFFF'
  },
  catActive: {
    backgroundColor: '#001F3F'
  },
  catText: {
    textTransform: 'capitalize',
    color: '#001F3F',
    fontSize: 14
  },
  catActiveText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  productList: {
    padding: 15
  },
  card: {
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
  img: {
    width: 80, 
    height: 80,
    borderRadius: 8
  },
  productInfo: {
    flex: 1, 
    paddingLeft: 15
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000000',
    lineHeight: 18
  },
  productPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001F3F'
  },
  productCategory: {
    marginTop: 4,
    fontSize: 12,
    color: '#666666',
    textTransform: 'capitalize'
  },
  retryButton: {
    backgroundColor: '#001F3F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});