export const generateEventPin = (length = 4): string => {
  const digits = '0123456789';
  let pin = '';

  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * digits.length);
    pin += digits[idx];
  }

  return pin;
};
