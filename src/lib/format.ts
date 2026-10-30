// Datas sempre em pt-BR e no fuso de São Paulo, igual no servidor e no navegador.
const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export function formatDateTime(value: string | Date): string {
  return dateTime.format(new Date(value));
}
