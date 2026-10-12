// Align this setting with the password requirements in the Clerk Dashboard.
const minimum = Number(process.env.REACT_APP_PASSWORD_MIN_LENGTH || 8);
export const PASSWORD_MIN_LENGTH = Number.isInteger(minimum) && minimum >= 8 ? minimum : 8;
export const PASSWORD_HINT = `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
