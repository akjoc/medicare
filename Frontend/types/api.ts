export interface APIProduct {
    id: number;
    name: string;
    sku: string;
    description: string;
    price: string | number;
    salePrice?: string | number;
    buyingPrice?: string | number;
    stock: number;
    imageUrls: string[];
    CategoryId: number;
    Categories?: Array<{
        id: number;
        name: string;
        slug: string;
        description?: string | null;
        isActive?: boolean;
        parentId?: number | null;
    }>;
    Category?: {
        id: number;
        name: string;
        slug: string;
    };
    companies?: string[] | string[][];
    Company?: {
        id: number;
        name: string;
        status: string;
    };
    salt?: string[] | string[][];
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    expiry?: string | null;
    dosage?: string;
    packing?: string;
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
