export const formatarMoeda = (valor) => {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
};

export const formatarTelefoneBR = (telefone) => {
  const numeroLimpo = String(telefone || '').replace(/\D/g, '');
  if (!numeroLimpo) return '';
  return numeroLimpo.startsWith('55') && numeroLimpo.length >= 12
    ? numeroLimpo
    : `55${numeroLimpo}`;
};

export const montarURLWhatsAppSeguro = (telefone, textoMensagem) => {
  const numeroComDDI = formatarTelefoneBR(telefone);
  if (!numeroComDDI) return null;
  const textoSemHash = String(textoMensagem || '').replace(/#/g, 'Nº ');
  return `https://api.whatsapp.com/send?phone=${numeroComDDI}&text=${encodeURIComponent(textoSemHash)}`;
};