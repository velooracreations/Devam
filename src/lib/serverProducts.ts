import fs from 'fs';
import path from 'path';
import { initialProducts, Product } from '@/lib/initialProducts';

const dataFilePath = path.join(process.cwd(), 'scratch_data', 'products.json');

// Global in-memory cache to ensure instant consistency across all requests
let inMemoryProducts: Product[] | null = null;

export function getServerProducts(): Product[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Fix any legacy .svg image paths to .png
        const sanitized = parsed.map((p: Product) => ({
          ...p,
          image: p.image?.endsWith('.svg') ? p.image.replace('.svg', '.png') : p.image
        }));
        inMemoryProducts = sanitized;
        return sanitized;
      }
    }
  } catch (e) {
    console.error('Error reading server products file:', e);
  }
  const sanitized = initialProducts.map((p: Product) => ({
    ...p,
    image: p.image?.endsWith('.svg') ? p.image.replace('.svg', '.png') : p.image
  }));
  inMemoryProducts = sanitized;
  saveServerProducts(sanitized);
  return sanitized;
}

export function saveServerProducts(products: Product[]): boolean {
  inMemoryProducts = products;
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (e) {
    // In serverless / read-only production environment (e.g. Cloud Functions), in-memory cache is used fallback
    return false;
  }
}
