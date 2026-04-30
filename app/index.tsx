import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();
  
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  // Nuevo estado para el mensaje de error
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Limpiamos el error previo al intentar de nuevo
    setError("");

    if (usuario.trim() === "Inversor" && password === "1234") {
      router.replace("/(tabs)/portfolio");
    } else {
      // En lugar de Alert, guardamos el mensaje en el estado
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>MarketRadar v1.0</Text>

        <TextInput 
          placeholder="Usuario: Inversor" 
          placeholderTextColor="#7d8fb3" 
          style={styles.input}
          value={usuario}
          onChangeText={(text) => {
            setUsuario(text);
            if (error) setError(""); // Limpia el error mientras escribes
          }}
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Contraseña: 1234" 
          placeholderTextColor="#7d8fb3" 
          secureTextEntry={true} 
          style={styles.input}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError(""); // Limpia el error mientras escribes
          }}
        />

        {/* Renderizado condicional del error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, error ? { marginTop: 10 } : { marginTop: 20 }]} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1324",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#121c33",
    padding: 25,
    borderRadius: 14,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#7d8fb3",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1b2a4a",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: "#fff",
  },
  // Estilo para el mensaje de error
  errorText: {
    color: "#ff5252",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#00c389",
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});