export interface IndianKycPayload {
  aadharNumber: string;
  panNumber: string;
}

/**
 * Encrypted form of IndianKycPayload. Fields are base64-encoded RSA-OAEP
 * ciphertext, produced client-side using the server's current public key.
 */
export interface IndianKycEncryptedPayload {
  aadharNumber: string;
  panNumber: string;
  keyVersion: number;
}

export interface IndianKycResponse {
  kycStatus: string;
}

export interface PublicKeyResponse {
  publicKey: string;
  version: number;
}
