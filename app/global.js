// global.js
export var misInversiones = [
  { id: '1', nombre: 'BTC', cantidad: 0.015, valor: 850.00, costo: 800.00 },
  { id: '2', nombre: 'ETH', cantidad: 0.5, valor: 650.50, costo: 700.00 }
];

export const actualizarInversiones = (nombreIngresado, cantidadIngresada, valorTotal) => {
  const nombreMayuscula = nombreIngresado.toUpperCase().trim();
  const nuevaCantidad = parseFloat(cantidadIngresada);
  const nuevoCosto = parseFloat(valorTotal);

  const indiceExistente = misInversiones.findIndex(
    (inv) => inv.nombre.toUpperCase() === nombreMayuscula
  );

  if (indiceExistente !== -1) {
    misInversiones[indiceExistente].cantidad += nuevaCantidad;
    misInversiones[indiceExistente].costo += nuevoCosto;
    // El 'valor' por ahora lo igualamos al costo hasta que tengamos precios en vivo
    misInversiones[indiceExistente].valor = misInversiones[indiceExistente].costo;
  } else {
    misInversiones.push({
      id: Math.random().toString(),
      nombre: nombreMayuscula,
      cantidad: nuevaCantidad,
      costo: nuevoCosto,
      valor: nuevoCosto, // Valor inicial = Costo inicial
    });
  }
};