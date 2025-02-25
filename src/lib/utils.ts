const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "SHA-256";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const key = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const hash = new Uint8Array(key);
  const hashArray = new Uint8Array(SALT_LENGTH + hash.length);
  hashArray.set(salt);
  hashArray.set(hash, SALT_LENGTH);

  return Buffer.from(hashArray).toString("base64");
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const hashArray = Buffer.from(hashedPassword, "base64");
  const salt = hashArray.slice(0, SALT_LENGTH);
  const hash = hashArray.slice(SALT_LENGTH);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const key = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const newHash = new Uint8Array(key);
  return (
    Buffer.from(newHash).toString("base64") ===
    Buffer.from(hash).toString("base64")
  );
}
