// global.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export var misInversiones = [];

// Reemplaza esto con tu token gratuito de Finnhub
const FINNHUB_API_KEY = 'cpfolihr01ql1vn33flgcpfolihr01ql1vn33fm0';

/**
 * Guarda el estado actual de misInversiones en el almacenamiento local
 */
const guardarEnDisco = async () => {
  try {
    const jsonValue = JSON.stringify(misInversiones);
    await AsyncStorage.setItem('@MarketRadar:inversiones', jsonValue);
  } catch (e) {
    console.error("Error guardando los datos en disco:", e);
  }
};

/**
 * Carga las inversiones guardadas del almacenamiento local
 */
export const cargarInversionesDeDisco = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@MarketRadar:inversiones');
    if (jsonValue != null) {
      misInversiones = JSON.parse(jsonValue);
    } else {
      misInversiones = [];
    }
    return misInversiones;
  } catch (e) {
    console.error("Error cargando los datos de disco:", e);
    return [];
  }
};

/**
 * Agrega o acumula una inversión de forma manual y la persiste
 */
export const actualizarInversiones = async (nombreIngresado, cantidadIngresada, valorTotal, categoria) => {
  const nombreMayuscula = nombreIngresado.toUpperCase().trim();
  const nuevaCantidad = parseFloat(cantidadIngresada);
  const nuevoCosto = parseFloat(valorTotal);

  const indiceExistente = misInversiones.findIndex(
    (inv) => inv.nombre.toUpperCase() === nombreMayuscula
  );

  if (indiceExistente !== -1) {
    misInversiones[indiceExistente].cantidad += nuevaCantidad;
    misInversiones[indiceExistente].costo += nuevoCosto;
    misInversiones[indiceExistente].valor = misInversiones[indiceExistente].costo;
  } else {
    misInversiones.push({
      id: Math.random().toString(),
      nombre: nombreMayuscula,
      cantidad: nuevaCantidad,
      costo: nuevoCosto,
      valor: nuevoCosto,
      categoria: categoria,
    });
  }

  // Guardamos los cambios inmediatamente en el almacenamiento local
  await guardarEnDisco();
};

const buscarIdCoinGecko = async (ticker) => {
  try {
    const respuestaSearch = await fetch(`https://api.coingecko.com/api/v3/search?query=${ticker}`);
    const datosSearch = await respuestaSearch.json();

    const monedaEncontrada = datosSearch.coins?.find(
      coin =>
        coin.symbol?.toUpperCase() === ticker ||
        coin.name?.toUpperCase() === ticker ||
        coin.id?.toUpperCase() === ticker
    );

    if (monedaEncontrada) return monedaEncontrada.id;

    const monedaFallback = datosSearch.coins?.find(
      coin =>
        coin.symbol?.toUpperCase().includes(ticker) ||
        coin.name?.toUpperCase().includes(ticker) ||
        coin.id?.toUpperCase().includes(ticker)
    );

    return monedaFallback ? monedaFallback.id : null;
  } catch (err) {
    console.error(`Error buscando ID en CoinGecko para ${ticker}:`, err);
    return null;
  }
};

const obtenerPrecioAccion = async (ticker) => {
  try {
    const respuesta = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_API_KEY}`
    );
    const datos = await respuesta.json();

    if (datos && datos.c) {
      return parseFloat(datos.c);
    }
    return null;
  } catch (err) {
    console.error(`Error obtuvo precio de Finnhub para ${ticker}:`, err);
    return null;
  }
};

export const actualizarPreciosEnTiempoReal = async () => {
  try {
    if (!misInversiones || misInversiones.length === 0) return misInversiones;

    const inversionesCripto = misInversiones.filter(inv => inv.categoria === 'criptos');
    const inversionesAcciones = misInversiones.filter(inv => inv.categoria === 'acciones');

    const preciosAccionesPromise = Promise.all(
      inversionesAcciones.map(async (inversion) => {
        const ticker = inversion.nombre.toUpperCase().trim();
        const precio = await obtenerPrecioAccion(ticker);
        return { ticker, precio };
      })
    );

    const promesasIds = inversionesCripto.map(async (inversion) => {
      const ticker = inversion.nombre.toUpperCase().trim();
      const idCoingecko = await buscarIdCoinGecko(ticker);
      return { ticker, idCoingecko };
    });

    const mapeoDinamico = await Promise.all(promesasIds);
    const idsParaApi = mapeoDinamico
      .map(item => item.idCoingecko)
      .filter(id => id)
      .join(',');

    const datosPreciosCripto = idsParaApi
      ? await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsParaApi}&vs_currencies=usd`)).json()
      : {};

    const preciosAcciones = await preciosAccionesPromise;

    misInversiones = misInversiones.map(inversion => {
      const ticker = inversion.nombre.toUpperCase().trim();

      if (inversion.categoria === 'acciones') {
        const resultado = preciosAcciones.find(item => item.ticker === ticker);
        if (resultado?.precio != null) {
          return {
            ...inversion,
            valor: inversion.cantidad * resultado.precio,
          };
        }
        return inversion;
      }

      if (inversion.categoria === 'criptos') {
        const coincidencia = mapeoDinamico.find(item => item.ticker === ticker);
        const idCoingecko = coincidencia ? coincidencia.idCoingecko : null;
        if (idCoingecko && datosPreciosCripto[idCoingecko]?.usd !== undefined) {
          const precioEnVivo = datosPreciosCripto[idCoingecko].usd;
          return {
            ...inversion,
            valor: inversion.cantidad * precioEnVivo,
          };
        }
      }

      return inversion;
    });

    // Guardamos los precios actualizados también en el disco
    await guardarEnDisco();
    return misInversiones;
  } catch (error) {
    console.error("Error general en la actualización de precios:", error);
    return misInversiones;
  }
};

export const obtenerHistoriaActivo = async (ticker, categoria) => {
  try {
    const queryTicker = ticker.toUpperCase().trim();
    console.log(`[Historial] Buscando para: ${queryTicker} (${categoria})`);

    if (categoria === 'acciones') {
      const proxyUrl = "https://corsproxy.io/?";
      const targetUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(queryTicker)}?interval=1d&range=7d`;
      
      const respuesta = await fetch(proxyUrl + encodeURIComponent(targetUrl));
      const datos = await respuesta.json();

      const precios = datos?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
      
      if (Array.isArray(precios)) {
        return precios.filter(precio => precio != null);
      }
      return [];
    }

    let idCoingecko = await buscarIdCoinGecko(queryTicker);
    if (!idCoingecko) {
      idCoingecko = queryTicker.toLowerCase();
    }

    const respuesta = await fetch(
      `https://api.coingecko.com/api/v3/coins/${idCoingecko}/market_chart?vs_currency=usd&days=7&interval=hourly`
    );
    const datos = await respuesta.json();
    
    return Array.isArray(datos.prices)
      ? datos.prices.map((entry) => entry[1])
      : [];
  } catch (error) {
    console.error(`Error obteniendo historial para ${ticker}:`, error);
    return [];
  }
};