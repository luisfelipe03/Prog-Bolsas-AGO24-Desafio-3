export const validatePostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{8}$/;
  return postalCodeRegex.test(postalCode);
};
