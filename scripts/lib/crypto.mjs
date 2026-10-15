import crypto from 'crypto';
import zlib from 'zlib';

/**
 * Cifra un buffer con compresión gzip previa y cifrado autenticado AES-256-GCM.
 * Formato del archivo resultante:
 * [16 bytes SALT] [12 bytes IV] [16 bytes AUTH TAG] [CIPHERTEXT GZIP]
 */
export function encryptBuffer(buffer, passphrase) {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('La passphrase de cifrado debe tener al menos 8 caracteres.');
  }
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const compressed = zlib.gzipSync(buffer, { level: 9 });
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]);
}

/**
 * Descifra y descomprime un buffer cifrado con AES-256-GCM.
 */
export function decryptBuffer(encryptedBuffer, passphrase) {
  if (!passphrase) {
    throw new Error('Debe proporcionar la passphrase para descifrar el respaldo.');
  }
  if (encryptedBuffer.length < 44) {
    throw new Error('Archivo de respaldo corrupto o incompleto (longitud menor a la cabecera criptográfica).');
  }
  const salt = encryptedBuffer.subarray(0, 16);
  const iv = encryptedBuffer.subarray(16, 28);
  const tag = encryptedBuffer.subarray(28, 44);
  const ciphertext = encryptedBuffer.subarray(44);

  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  
  try {
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return zlib.gunzipSync(decrypted);
  } catch (err) {
    throw new Error('Fallo de autenticación criptográfica: Passphrase incorrecta o respaldo alterado/corrupto.');
  }
}

/**
 * Calcula el hash SHA-256 de un buffer para verificación de integridad.
 */
export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
