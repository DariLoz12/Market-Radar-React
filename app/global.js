export var misInversiones = [
    { id: '1', nombre: 'Crypto', valor: 850.00 },
    { id: '2', nombre: 'Stocks', valor: 650.50 }
  ];
  
  export const actualizarInversiones = (nombreIngresado, valorIngresado) => {
    misInversiones.push({
      id: Math.random().toString(),
      nombre: nombreIngresado, // Usamos "nombre"
      valor: parseFloat(valorIngresado) // Usamos "valor"
    });
  };