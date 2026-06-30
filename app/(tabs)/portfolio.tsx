import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { actualizarPreciosEnTiempoReal, misInversiones } from '../global'; // Asegúrate de importar la función

export default function HomeScreen() {
  const [datosActuales, setDatosActuales] = useState([...misInversiones]);
  const [cargandoPrecios, setCargandoPrecios] = useState(false);
  const [cargandoGrafico, setCargandoGrafico] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [historiasSemana, setHistoriasSemana] = useState<Record<string, number[]>>({});

  const buscarIdCoingecko = async (ticker: string): Promise<string | null> => {
    try {
      const respuestaSearch = await fetch(`https://api.coingecko.com/api/v3/search?query=${ticker}`);
      const datosSearch = await respuestaSearch.json();
      const monedaEncontrada = datosSearch.coins?.find(
        (coin: any) =>
          coin.symbol?.toUpperCase() === ticker ||
          coin.name?.toUpperCase() === ticker ||
          coin.id?.toUpperCase() === ticker
      );

      if (monedaEncontrada) {
        return monedaEncontrada.id;
      }

      const monedaFallback = datosSearch.coins?.find(
        (coin: any) =>
          coin.symbol?.toUpperCase().includes(ticker) ||
          coin.name?.toUpperCase().includes(ticker) ||
          coin.id?.toUpperCase().includes(ticker)
      );

      return monedaFallback ? monedaFallback.id : null;
    } catch (err) {
      console.error(`Error buscando ID de CoinGecko para gráfico ${ticker}:`, err);
      return null;
    }
  };

  const obtenerHistoriaSieteDias = async (inversiones: Array<{ id: string; nombre: string }>) => {
    setCargandoGrafico(true);
    try {
      const promesas = inversiones.map(async (inversion) => {
        const ticker = inversion.nombre.toUpperCase().trim();
        const idCoingecko = await buscarIdCoingecko(ticker);
        if (!idCoingecko) return { key: inversion.id, data: [] };

        const respuesta = await fetch(
          `https://api.coingecko.com/api/v3/coins/${idCoingecko}/market_chart?vs_currency=usd&days=7&interval=hourly`
        );
        const datos = await respuesta.json();
        const precios = Array.isArray(datos.prices)
          ? datos.prices.map((entry: any[]) => entry[1])
          : [];
        return { key: inversion.id, data: precios };
      });

      const resultados = await Promise.all(promesas);
      const nuevoHistorial = resultados.reduce<Record<string, number[]>>((acc, item) => {
        acc[item.key] = item.data;
        return acc;
      }, {});
      setHistoriasSemana(prev => ({ ...prev, ...nuevoHistorial }));
    } catch (error) {
      console.error('Error cargando historial semanal:', error);
    } finally {
      setCargandoGrafico(false);
    }
  };

  const muestrearPrecios = (precios: number[]) => {
    if (precios.length <= 7) return precios;
    const step = Math.max(1, Math.floor(precios.length / 7));
    const muestreados = precios.filter((_, index) => index % step === 0);
    return muestreados.length > 7 ? muestreados.slice(0, 7) : muestreados;
  };

  useFocusEffect(
    useCallback(() => {
      setDatosActuales([...misInversiones]);

      const obtenerPreciosVivos = async () => {
        setCargandoPrecios(true);
        const datosNuevos = await actualizarPreciosEnTiempoReal();
        setDatosActuales([...datosNuevos]);
        await obtenerHistoriaSieteDias(datosNuevos);
        setCargandoPrecios(false);
      };

      obtenerPreciosVivos();
    }, [])
  );

  const totalBalance = datosActuales.reduce((sum, inv) => sum + inv.valor, 0);
  const totalCosto = datosActuales.reduce((sum, inv) => sum + inv.costo, 0);
  const totalGananciaPct = totalCosto > 0 ? ((totalBalance - totalCosto) / totalCosto) * 100 : 0;

  // Filtrar inversiones según la categoría seleccionada
  const inversionesFiltradas = categoriaSeleccionada === 'todos'
    ? datosActuales
    : datosActuales.filter((inv) => inv.categoria === categoriaSeleccionada);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>BALANCE TOTAL</Text>
        <Text style={styles.balance}>${totalBalance.toFixed(2)}</Text>

        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: totalGananciaPct >= 0 ? '#10B981' : '#EF4444' }]}>
            {totalGananciaPct >= 0 ? '+' : ''}{totalGananciaPct.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Selector de categoría */}
      <Text style={styles.filterLabel}>
        Filtrar por categoría:
      </Text>

      <View style={styles.categorySelector}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            categoriaSeleccionada === 'todos' &&
            styles.categoryButtonActive,
          ]}
          onPress={() => setCategoriaSeleccionada('todos')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              categoriaSeleccionada === 'todos' &&
              styles.categoryButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            categoriaSeleccionada === 'acciones' &&
            styles.categoryButtonActive,
          ]}
          onPress={() => setCategoriaSeleccionada('acciones')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              categoriaSeleccionada === 'acciones' &&
              styles.categoryButtonTextActive,
            ]}
          >
            Acciones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            categoriaSeleccionada === 'criptos' &&
            styles.categoryButtonActive,
          ]}
          onPress={() => setCategoriaSeleccionada('criptos')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              categoriaSeleccionada === 'criptos' &&
              styles.categoryButtonTextActive,
            ]}
          >
            Criptos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus Inversiones</Text>

        {inversionesFiltradas.map((inv) => {
          const gananciaUsd = inv.valor - inv.costo;
          const rendimientoPct = inv.costo > 0 ? (gananciaUsd / inv.costo) * 100 : 0;
          const esPositivo = gananciaUsd >= 0;
          const precioUnitario = inv.cantidad > 0 ? inv.valor / inv.cantidad : 0;
          const historia = historiasSemana[inv.id] || [];
          const barras = muestrearPrecios(historia);
          const tieneGrafico = barras.length > 0;
          const minPrecio = tieneGrafico ? Math.min(...barras) : 0;
          const maxPrecio = tieneGrafico ? Math.max(...barras) : 0;
          const chartWidth = 1480;
          const chartHeight = 280;
          const paddingX = 20;
          const paddingY = 24;
          const usableWidth = chartWidth - paddingX * 2;
          const usableHeight = chartHeight - paddingY * 2;

          const puntos = barras.map((precio, index) => {
            const x = paddingX + (usableWidth / Math.max(barras.length - 1, 1)) * index;
            const normalizado = maxPrecio === minPrecio ? 0.5 : (precio - minPrecio) / (maxPrecio - minPrecio);
            const y = paddingY + usableHeight - normalizado * usableHeight;
            return { x, y, precio };
          });

          const pathData = puntos.length > 1
            ? puntos.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
            : '';

          const labelsDias = Array.from({ length: 7 }, (_, index) => {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - (6 - index));
            return fecha
              .toLocaleDateString('es-ES', { weekday: 'short' })
              .replace('.', '');
          });

          return (
            <View key={inv.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.cardName}>{inv.nombre}</Text>
                  <Text style={styles.cardQty}>{inv.cantidad.toFixed(4)} {inv.nombre}</Text>
                  <Text style={styles.cardValue}>
                    ${precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.cardValue}>${inv.valor.toFixed(2)}</Text>
                  <Text style={[styles.rendimiento, { color: esPositivo ? '#10B981' : '#EF4444' }]}>
                    {esPositivo ? '+' : ''}{gananciaUsd.toFixed(2)} ({rendimientoPct.toFixed(2)}%)
                  </Text>
                </View>
              </View>
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>Última semana (1W)</Text>
                {tieneGrafico ? (
                  <View style={styles.chartCard}>
                    <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMinYMid meet">
                      <Line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#334155" strokeWidth="1" />
                      <Line x1={paddingX} y1={paddingY} x2={paddingX} y2={chartHeight - paddingY} stroke="#334155" strokeWidth="1" />
                      <Path d={pathData} fill="none" stroke="#22c55e" strokeWidth="2.5" />
                      {puntos.map((punto, index) => (
                        <React.Fragment key={index}>
                          <Circle cx={punto.x} cy={punto.y} r="3" fill="#22c55e" />
                          <SvgText x={punto.x} y={punto.y - 10} fill="#F8FAFC" fontSize="10" fontWeight="600" textAnchor="middle">
                            ${punto.precio.toFixed(2)}
                          </SvgText>
                        </React.Fragment>
                      ))}
                      {labelsDias.map((dia, index) => {
                        const x = paddingX + (usableWidth / Math.max(labelsDias.length - 1, 1)) * index;
                        return <SvgText key={dia + index} x={x} y={chartHeight - 4} fill="#94A3B8" fontSize="10" textAnchor="middle">{dia}</SvgText>;
                      })}
                    </Svg>
                  </View>
                ) : (
                  <Text style={styles.chartPlaceholder}>
                    {cargandoGrafico ? 'Cargando gráfico...' : 'Sin historial disponible'}
                  </Text>
                )}
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
  badge: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  badgeText: { color: '#10B981', fontWeight: '700', fontSize: 12 },
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSection: {
    width: '100%',
    marginTop: 8,
  },
  chartTitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    alignItems: 'flex-start',
    width: '100%',
    overflow: 'hidden',
    marginLeft: 0,
    marginRight: 0,
    maxWidth: '100%',
  },
  chartPlaceholder: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
  },
  cardUnitPrice: {
    color: '#64748B', // Un gris más oscuro (slate-500) para darle jerarquía
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },

  categoryButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },

  categoryButtonActive: {
    backgroundColor: '#00d094',
    borderColor: '#00d094',
  },

  categoryButtonText: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 13,
  },

  categoryButtonTextActive: {
    color: '#090f1d',
    fontWeight: 'bold',
  },

  filterLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 20,
  },  
});