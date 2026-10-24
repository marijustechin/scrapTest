const dateFormatter = new Intl.DateTimeFormat('lt-LT', { dateStyle: 'medium' });

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
