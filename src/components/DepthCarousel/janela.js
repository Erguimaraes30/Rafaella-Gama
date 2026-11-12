// Distância do card `i` até a posição `pos` do carrossel; com loop, pelo lado mais curto da volta.
export const distancia = (i, pos, n, loop) => {
  let d = i - pos;
  if (loop && n > 1) {
    d = ((d % n) + n) % n;
    if (d > n / 2) d -= n;
  }
  return d;
};

// Índices a até `raio` cards do `centro` (incluindo ele): os que valem a pena já ter a imagem carregada.
export const indicesProximos = (centro, n, raio, loop) => {
  const indices = new Set();
  for (let k = -raio; k <= raio; k++) {
    const i = centro + k;
    if (loop) indices.add(((i % n) + n) % n);
    else if (i >= 0 && i < n) indices.add(i);
  }
  return indices;
};
