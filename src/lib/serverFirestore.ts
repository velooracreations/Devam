import { Firestore } from '@google-cloud/firestore';
import fs from 'fs';
import path from 'path';

let firestoreInstance: Firestore | null = null;

// Embedded secure service credentials for devam-ecommerce Cloud Firestore
const EMBEDDED_CREDENTIALS = {
  projectId: 'devam-ecommerce',
  clientEmail: 'devam-server@devam-ecommerce.iam.gserviceaccount.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC9sS6KYYpQiai4\nTvj/hqLFpp/4zt2LHXqFkJMPj0W6kITonslSU7aNPje53tKbG3h3VpggNyu4a8r8\nhoFTqX05/ezjm73s9h1TjfCGdAbMtnPunf+mAQUL//dBJt4S9GxqAOxyUO5GUkjb\nmH/RS93TNrs2jjpgMLCh8ZIsW6JmvtGFnqezEi0RCqffbZRgn9OxAvBxV6JtHzlr\ncq2h43hWw2B3uEkcmjHtupyxw/QwLlVyEie6h/7sXcuryadXBr+L9kR31CdjnjA2\nEExa0r4uws+iUNAa0w+wq6svKFy64lb5zpTOoW45mpmjg2rOID8L/4Hn2lpj+iFk\nbdeoZadPAgMBAAECggEAGwMiqgEG1b4soQZZ7eVJw5SdPiyTHs7VVjTGxFX2K4GN\n86Q87fTOz6E3BUhmPEE2r+PMaPYCS1JKRxiOTRAbLYlr1OOmMZrAhVf2kubt2vP2\nYVntgEGv6swJ9SSoRhG5aIT2JrdAnxHznxXBydegYIXwNe4eAPmeBYmlc5ye7Ttr\nTsn1SQ7PsEnWrigIROtLx84yv1K+Sb1O6eV3yKMhmqS+mqkuYxY4PTSQwjcet3tj\nTEz93Mv4CHmCMRywYHEDtm0GwT8cLrpXkkoEd9KTh6XaA9KekEuCjVBLmp2XIz1z\nHqC5OwZ1LWYCLFUe7PPcEOO2zX3m1sugXAvWYyeobQKBgQDcnYj4+/C8sg38jhAq\naVYm4NJSc1l+k0QQW/u206nAe60NvB/2PGRK9/fJ0D0c1sJtt6mUqFZLppJPvuJ2\nplb1Xzzeb8H9y1r9S0IiDRpURYSvO3m61r38ILomKDggVTa0VE2B9Nujox8vDpJF\n7JsVd3ClOSqe8m5Vr/4IsVwV/QKBgQDcHfAupzfNXAYQsHZg0a2WSiKVsZV5U5ei\nfe7DncxfG+IoAvZztBI0mwZKlQ1n6/SEiEw72KKAVbQmQUi/ucTy1ECrcDBoOWfF\nG3OpyyzHuBNpeSIKnIETmDRRAbGanRepnKJyhfO0kI1JIlA6A7gE3up2cPmKPZe5\nVcRTQ9fOOwKBgHlBqQhYyW+dWeynVKFK9kw2I8OnnNfiL3XiaM6LNfESyQIUlWis\ntt8xvaLR7tUMAR925CFOCOhZrG9iVmyqbn89EmKcAH7zJ5ayp625j/AjqZL62KRl\n5VRP1KCmWHsE+yVQdK1qHNKrFLezhZgjPPYmiOZ3LkLgst4r9i9m9FstAoGAX8CS\nQ+kwCCB47vekd1efGJqlUtMOf9nSQ7heji/twI3jop4vUYPKy6GIahdO3p8xHhog\nd4Q0pHkjxeRuXiDUwQF+JFXIaP5X2tGnTfx5PWQg5afxHAaay8hRMc/3z5d4vKrL\nq+ADdM/Q9jh8B9CoU04ZVm6szusePlxF7Ca+ERMCgYA3BxPgsQPzoSgRTFfWZJAZ\njd7TYuA/ZplOh0WJkkenqn5/WSbHKI+5QCFl2+Rak3PZAXpEGzTmMFzRiFwkGqzL\nhGQ+8npNUBwi1ZpJ9x3UCAUCNUYi2BrL9UzDUNF+0GMiii/q1UQ+G6v01FKmvF8X\ncl3H0GyIwYATGGldv6JWGg==\n-----END PRIVATE KEY-----\n',
};

export function getServerFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;

  try {
    // 1. Try environment variable JSON if provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        firestoreInstance = new Firestore({
          projectId: parsed.project_id || parsed.projectId || 'devam-ecommerce',
          credentials: {
            client_email: parsed.client_email || parsed.clientEmail,
            private_key: (parsed.private_key || parsed.privateKey || '').replace(/\\n/g, '\n'),
          },
        });
        return firestoreInstance;
      } catch (e) {
        console.warn('[FirestoreServer] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var:', e);
      }
    }

    // 2. Try local service-account-key.json file if present
    const keyPath = path.join(process.cwd(), 'service-account-key.json');
    if (fs.existsSync(keyPath)) {
      try {
        const fileContent = fs.readFileSync(keyPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        firestoreInstance = new Firestore({
          projectId: parsed.project_id || 'devam-ecommerce',
          credentials: {
            client_email: parsed.client_email,
            private_key: parsed.private_key,
          },
        });
        return firestoreInstance;
      } catch (e) {
        console.warn('[FirestoreServer] Failed to read local service-account-key.json:', e);
      }
    }

    // 3. Fallback to embedded credentials
    firestoreInstance = new Firestore({
      projectId: EMBEDDED_CREDENTIALS.projectId,
      credentials: {
        client_email: EMBEDDED_CREDENTIALS.clientEmail,
        private_key: EMBEDDED_CREDENTIALS.privateKey,
      },
    });
    return firestoreInstance;
  } catch (err) {
    console.error('[FirestoreServer] Could not initialize Firestore:', err);
    return null;
  }
}
