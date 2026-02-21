export interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  saved_address?: string;
  saved_city?: string;
  saved_postal?: string;
  isAdmin?: boolean;
}
