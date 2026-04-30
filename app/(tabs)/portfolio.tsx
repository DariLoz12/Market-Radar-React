import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { misInversiones } from '../global';

export default function HomeScreen() {
  // Este estado solo sirve para obligar a la pantalla a actualizarse
  const [datosActuales, setDatosActuales] = useState([...misInversiones]);

  useFocusEffect(
    useCallback(() => {
      // CADA VEZ QUE ENTRAS A LA PANTALLA:
      // Forzamos una copia nueva del array global al estado local
      setDatosActuales([...misInversiones]);
    }, [])
  );

  const totalBalance = datosActuales.reduce((sum, inv) => sum + inv.valor, 0);

  return (
    <ScrollView style={styles.container}> 
      <View style={styles.header}>
        <Text style={styles.subtitle}>BALANCE TOTAL</Text>
        <Text style={styles.balance}>${totalBalance.toFixed(2)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+12.5% esta semana</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus Inversiones</Text>
        
        {datosActuales.map((inv) => {
          const gananciaUsd = inv.valor - inv.costo;
          const rendimientoPct = (gananciaUsd / inv.costo) * 100;
          const esPositivo = gananciaUsd >= 0;

          return (
            <View key={inv.id} style={styles.card}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.cardName}>{inv.nombre}</Text>
                <Text style={styles.cardQty}>{inv.cantidad.toFixed(4)} {inv.nombre}</Text>
              </View>

              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.cardValue}>${inv.valor.toFixed(2)}</Text>
                <Text style={[styles.rendimiento, { color: esPositivo ? '#10B981' : '#EF4444' }]}>
                  {esPositivo ? '+' : ''}{gananciaUsd.toFixed(2)} ({rendimientoPct.toFixed(2)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  subtitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  balance: { color: '#F8FAFC', fontSize: 40, fontWeight: 'bold', marginVertical: 8 },
  badge: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  section: { paddingHorizontal: 20 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  cardName: { color: '#CBD5E1', fontSize: 16, fontWeight: 'bold' },
  cardValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  rendimiento: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  cardQty: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  card: { 
    backgroundColor: '#1E293B', 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
});