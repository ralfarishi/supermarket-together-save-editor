/* eslint-disable @typescript-eslint/no-explicit-any */
const PASSWORD_KEY = 'g#asojrtg@omos)^yq';

export interface DecryptedSaveResult {
  plaintext: string;
  wasGzipped: boolean;
}

/**
 * Pipes a Uint8Array through a TransformStream (e.g. CompressionStream or DecompressionStream).
 */
async function pipeThrough(data: Uint8Array, stream: TransformStream): Promise<Uint8Array> {
  const blob = new Blob([data as BufferSource]);
  const responseStream = blob.stream().pipeThrough(stream);
  const reader = responseStream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

/**
 * Checks if a byte array starts with the Gzip magic header.
 */
function isGzip(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
}

/**
 * Derives an AES-CBC 128-bit key from the password using PBKDF2 with SHA-1,
 * 100 iterations, and the IV as the salt (matching Easy Save 3 standard encryption).
 */
async function deriveKey(iv: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(PASSWORD_KEY);

  // 1. Import raw password bytes as a PBKDF2 key
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // 2. Derive AES-CBC key using PBKDF2 with SHA-1, 100 iterations, and IV as salt
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: iv as BufferSource,
      iterations: 100,
      hash: 'SHA-1',
    },
    baseKey,
    { name: 'AES-CBC', length: 128 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Decrypts an Easy Save 3 encrypted file buffer.
 * Slices the first 16 bytes as the IV, derives the PBKDF2 key, decrypts the ciphertext,
 * and handles optional Gzip decompression.
 */
export async function decryptSave(encryptedBuffer: ArrayBuffer): Promise<DecryptedSaveResult> {
  if (encryptedBuffer.byteLength < 16) {
    throw new Error('Save file is too short (missing IV header).');
  }

  const iv: Uint8Array = new Uint8Array(encryptedBuffer.slice(0, 16));
  const ciphertext = encryptedBuffer.slice(16);

  // Derive AES key using PBKDF2 and the IV
  const key = await deriveKey(iv);

  // Decrypt using Web Crypto
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv as BufferSource },
    key,
    ciphertext
  );

  let decryptedBytes: Uint8Array = new Uint8Array(decryptedBuffer);
  let wasGzipped = false;

  // Check if decrypted payload is gzipped
  if (isGzip(decryptedBytes)) {
    wasGzipped = true;
    const decompressStream = new DecompressionStream('gzip');
    decryptedBytes = await pipeThrough(decryptedBytes, decompressStream);
  }

  const decoder = new TextDecoder('utf-8');
  const decrypted = decoder.decode(decryptedBytes);

  // Sanitize Easy Save 3 array primitive serialization formatting (e.g. "__type" : "bool"true) to valid JSON
  const sanitized = decrypted.replace(
    /("__type"\s*:\s*"([^"]+)")\s*(true|false|[-+\d.eE]+|""|"[^"]*")/g,
    '$1, "value" : $3'
  );

  return {
    plaintext: sanitized,
    wasGzipped,
  };
}

/**
 * Encrypts a plaintext JSON save string back into Easy Save 3 encrypted file buffer.
 * Applies optional Gzip compression, prefixes a random 16-byte IV, and encrypts.
 */
export async function encryptSave(plaintext: string, shouldGzip: boolean): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  let plaintextBytes: Uint8Array = encoder.encode(plaintext);

  // If the file was originally gzipped, compress it back
  if (shouldGzip) {
    const compressStream = new CompressionStream('gzip');
    plaintextBytes = await pipeThrough(plaintextBytes, compressStream);
  }

  // Generate a random 16-byte IV
  const iv: Uint8Array = window.crypto.getRandomValues(new Uint8Array(16));

  // Derive AES key using PBKDF2 and the IV
  const key = await deriveKey(iv);

  // Encrypt using Web Crypto
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: iv as BufferSource },
    key,
    plaintextBytes as BufferSource
  );

  // Combine IV and ciphertext
  const result = new Uint8Array(16 + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), 16);

  return result.buffer;
}

/**
 * Custom recursive serializer for Easy Save 3 JSON structure.
 * Standard JSON properties are formatted nicely, while primitive wrappers in arrays 
 * are serialized into Easy Save 3 custom format (e.g., {"__type" : "bool"true} with no comma).
 */
export function serializeEasySave3(data: any, indent: number = 0): string {
  const tabs = '\t'.repeat(indent);
  const nextTabs = '\t'.repeat(indent + 1);

  if (data === null) return 'null';
  if (typeof data === 'boolean') return data ? 'true' : 'false';
  if (typeof data === 'number') return data.toString();
  if (typeof data === 'string') return JSON.stringify(data);

  if (Array.isArray(data)) {
    // Check if this is an array of primitive wrappers, e.g. [{ __type: "bool", value: true }]
    const isPrimitiveWrapperArray = data.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        '__type' in item &&
        'value' in item &&
        Object.keys(item).length === 2 &&
        (typeof item.value !== 'object' || item.value === null)
    );

    if (isPrimitiveWrapperArray) {
      const items = data.map((item) => {
        const valStr = typeof item.value === 'string'
          ? JSON.stringify(item.value)
          : item.value.toString();
        // Return the custom Easy Save 3 format: {"__type" : "type"value}
        return `{\n${nextTabs}\t"__type" : "${item.__type}"${valStr}\n${nextTabs}}`;
      });
      return `[\n${nextTabs}${items.join(`,\n${nextTabs}`)}\n${tabs}]`;
    }

    // Check if it's a standard primitive array (e.g., propinfoproduct values like [144,36,...])
    const isPrimitiveArray = data.every(
      (item) => typeof item === 'number' || typeof item === 'boolean' || typeof item === 'string' || item === null
    );
    if (isPrimitiveArray) {
      const items = data.map((item) => typeof item === 'string' ? JSON.stringify(item) : String(item));
      return `[\n${nextTabs}${items.join(',')}\n${tabs}]`;
    }

    const items = data.map((item) => serializeEasySave3(item, indent + 1));
    return `[\n${nextTabs}${items.join(',')}\n${tabs}]`;
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    const parts = keys.map((key) => {
      const valStr = serializeEasySave3(data[key], indent + 1);
      return `"${key}" : ${valStr}`;
    });
    return `{\n${nextTabs}${parts.join(`,\n${nextTabs}`)}\n${tabs}}`;
  }

  return '';
}
