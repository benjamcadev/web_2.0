export function useOrderValidation() {
  const normalizeEmail = (email: string): string => email.toLowerCase().trim();
  const normalizePhone = (phone: string): string => phone.replace(/\s+/g, '');

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  };

  const validateConfirmation = (
    input: string,
    clientData: any
  ): { isValid: boolean; message: string } => {
    if (!clientData) {
      return { isValid: false, message: "Error: datos del cliente no disponibles" };
    }

    const inputTrimmed = input.trim();

    if (!isValidEmail(inputTrimmed) && !isValidPhone(inputTrimmed)) {
      return {
        isValid: false,
        message: "Por favor ingresa un **correo válido** (ej: usuario@email.com) o un **teléfono válido** (ej: +56912345678). ❌"
      };
    }

    const isEmailMatch = isValidEmail(inputTrimmed) &&
      normalizeEmail(inputTrimmed) === normalizeEmail(clientData.email);
    const isPhoneMatch = isValidPhone(inputTrimmed) &&
      normalizePhone(inputTrimmed) === normalizePhone(clientData.telefono);

    if (isEmailMatch || isPhoneMatch) {
      return { isValid: true, message: "" };
    }

    return {
      isValid: false,
      message: `El correo o teléfono proporcionado no coincide con el RUT. ❌\n\nPor favor intenta de nuevo.`
    };
  };

  return {
    validateConfirmation,
  };
}