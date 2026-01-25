export interface APIProduct {
    id: number; // Backend uses numbers for ID
    name: string;
    sku: string;
    description: string;
    price: string | number; // JSON shows "5.00" string, but safely handle number
    salePrice?: string | number;
    stock: number;
    imageUrls: string[]; // Replaces 'images'
    CategoryId: number; // Replaces 'categoryIds' array
    Category?: {
        id: number;
        name: string;
        slug: string;
    };
    companies?: string[];
    salt?: string[]; // Check if backend returns 'salt' or if it's different. Mocks had string[].
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface APICategory {
    id: number;
    name: string;
    description?: string;
    parentId?: number | null;
    productCount?: number;
    subCategories?: APICategory[]; // For nested structure
}
export interface APICartItem {
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    Product: APIProduct;
}

export interface APICart {
    id: number;
    status: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    CartItems: APICartItem[];
}
