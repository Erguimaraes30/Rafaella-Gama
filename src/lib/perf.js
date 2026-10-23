// Orçamento de desempenho dos efeitos animados.
// "Modesto": até 4 núcleos, até 4 GB de memória ou economia de dados ligada. Nesses aparelhos os
// efeitos continuam todos lá, só que desenhados em resolução menor.
const nav = typeof navigator === 'undefined' ? {} : navigator;

export const MODESTO =
  (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4 || nav.connection?.saveData === true;

if (MODESTO && typeof document !== 'undefined') document.documentElement.dataset.desempenho = 'modesto';

// Densidade máxima de pixels. Fundos ficam sob véu fosco e estática: nitidez de tela retina não aparece
// neles. Destaques (crachá, retratos) ficam em até 1,5×.
export const DPR_FUNDO = MODESTO ? 0.75 : 1;
export const DPR_DESTAQUE = MODESTO ? 1 : 1.5;
