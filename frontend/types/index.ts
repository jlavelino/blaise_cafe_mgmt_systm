export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  size: string | null;
  price: string | number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  category: {
    id: string;
    name: string;
    sortOrder?: number;
  };
  variants: ProductVariant[];
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  size: string | null;
  unitPrice: number;
  quantity: number;
}
