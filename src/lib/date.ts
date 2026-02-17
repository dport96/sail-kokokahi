export const normalizeEventDate = (rawDate: string): string => {
  if (!rawDate) {
    return '';
  }

  if (rawDate.includes('/')) {
    const [month, day, year] = rawDate.split('/');
    if (!month || !day || !year) {
      return '';
    }

    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }

  return '';
};
