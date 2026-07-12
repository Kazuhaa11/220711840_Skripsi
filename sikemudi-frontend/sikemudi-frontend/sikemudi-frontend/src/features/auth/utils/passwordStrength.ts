export const PASSWORD_STRENGTH_HINT =
  "Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.";

export function getPasswordStrengthError(
  password: string,
  required = false,
): string | null {
  if (!password) {
    return required ? "Password wajib diisi." : null;
  }

  if (password.length < 8) {
    return "Password minimal 8 karakter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password harus mengandung huruf kecil.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password harus mengandung huruf besar.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password harus mengandung angka.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password harus mengandung simbol.";
  }

  return null;
}
