export interface Category {
    id: string;
    name: string;
    description?: string;
    parentId?: string | null; // For sub-categories
    image?: string;
    productCount: number;
    status: "active" | "inactive";
}

export interface Product {
    id: string;
    name: string;
    salt?: string[]; // Chemical composition - array of strings
    companies?: string[]; // Changed from company string to array
    buyingPrice?: number;
    categoryIds: string[]; // Changed to array for multi-select
    price: number;
    salePrice?: number;
    stock?: number;
    description?: string;
    imageUrls?: string[]; // Max 5 images
    sku?: string;
    status: "active" | "inactive" | "out_of_stock";
    createdAt: string;
    dosage?: string;
    packing?: string;
}

export const MOCK_CATEGORIES: Category[] = [];

export const MOCK_PRODUCTS: Product[] = [];
