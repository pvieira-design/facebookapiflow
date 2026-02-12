import crypto from "crypto";

// Handle both real newlines and escaped \n from env vars
const FLOW_PRIVATE_KEY = (process.env.FLOW_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
const FLOW_PASSPHRASE = process.env.FLOW_PASSPHRASE ?? "";

export function decryptRequest(body: {
  encrypted_aes_key: string;
  encrypted_flow_data: string;
  initial_vector: string;
}) {
  const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

  const privateKey = crypto.createPrivateKey({
    key: FLOW_PRIVATE_KEY,
    passphrase: FLOW_PASSPHRASE,
  });

  const decryptedAesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encrypted_aes_key, "base64"),
  );

  const iv = Buffer.from(initial_vector, "base64");
  const encryptedData = Buffer.from(encrypted_flow_data, "base64");
  const TAG_LENGTH = 16;
  const encrypted = encryptedData.subarray(0, -TAG_LENGTH);
  const tag = encryptedData.subarray(-TAG_LENGTH);

  const decipher = crypto.createDecipheriv("aes-128-gcm", decryptedAesKey, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return {
    decryptedBody: JSON.parse(decrypted.toString("utf-8")),
    aesKey: decryptedAesKey,
    iv,
  };
}

export function encryptResponse(
  response: object,
  aesKey: Buffer,
  iv: Buffer,
) {
  const flippedIv = Buffer.from(iv.map((b) => ~b));
  const cipher = crypto.createCipheriv("aes-128-gcm", aesKey, flippedIv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(response), "utf-8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  return encrypted.toString("base64");
}
