import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { misInversiones } from '../global';

export default function HomeScreen() {
  // Este estado solo sirve para obligar a la pantalla a actualizarse
  const [refresh, setRefresh] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // Sumamos 1 al estado para que React "re-renderice" la pantalla
      setRefresh(prev => prev + 1);
    }, [])
  );

  const totalBalance = misInversiones.reduce((sum, inv) => sum + inv.valor, 0);

  return (
    <ScrollView style={styles.container} key={refresh}> 
      <View style={styles.header}>
        <Text style={styles.subtitle}>TOTAL BALANCE</Text>
        <Text style={styles.balance}>${totalBalance.toFixed(2)}</Text>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+12.5% this week</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Investments</Text>
        
        {misInversiones.map((inv) => (
          <View key={inv.id} style={styles.card}>
            <Text style={styles.cardName}>{inv.nombre}</Text>
            <Text style={styles.cardValue}>${inv.valor.toFixed(2)}</Text>
          </View>
        ))}
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
  card: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardName: { color: '#CBD5E1', fontSize: 16 },
  cardValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
});