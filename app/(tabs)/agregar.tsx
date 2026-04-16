import { useRouter } from 'expo-router'; // <--- 2. IMPORTAMOS EL NAVEGADOR
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarInversiones } from '../global'; // <--- 1. IMPORTAMOS LA FUNCIÓN

export default function ExploreScreen() {
  const [activo, setActivo] = useState('');
  const [monto, setMonto] = useState('');
  const [precio, setPrecio] = useState('');
  const router = useRouter(); // <--- 3. CREAMOS EL CONTROLADOR DEL NAVEGADOR

const guardarInversion = () => {
  if (!activo || !monto || !precio) {
    Alert.alert("Error", "Por favor completa todos los campos");
    return;
  }
  
  const valorTotal = parseFloat(monto) * parseFloat(precio);

  // Llamamos a la función (la lógica nueva en global.js hará el resto)
  actualizarInversiones(activo, valorTotal);
  
  Alert.alert("¡Éxito!", `Cartera actualizada: ${activo.toUpperCase()}`);
  
  setActivo('');
  setMonto('');
  setPrecio('');
  router.replace('/'); 
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Inversión</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Activo</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: BTC o AAPL" 
          placeholderTextColor="#666"
          value={activo}
          onChangeText={setActivo}
        />

        <Text style={styles.label}>Cantidad</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 0.5" 
          keyboardType="numeric"
          placeholderTextColor="#666"
          value={monto}
          onChangeText={setMonto}
        />

        <Text style={styles.label}>Precio de Compra (USD)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 50000" 
          keyboardType="numeric"
          placeholderTextColor="#666"
          value={precio}
          onChangeText={setPrecio}
        />

        <TouchableOpacity style={styles.button} onPress={guardarInversion}>
          <Text style={styles.buttonText}>Agregar a mi Portfolio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#090f1d', 
    padding: 25, 
    justifyContent: 'center' 
  },
  title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 40, 
    textAlign: 'center' 
  },
  form: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 15,
  },
  label: {
    color: '#9ca3af',
    marginBottom: 8,
    fontSize: 14,
  },
  input: { 
    backgroundColor: '#1f2937', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20,
    fontSize: 16
  },
  button: { 
    backgroundColor: '#00d094', 
    padding: 18, 
    borderRadius: 10, 
    marginTop: 10 
  },
  buttonText: { 
    color: '#090f1d', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});