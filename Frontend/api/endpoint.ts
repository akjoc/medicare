export const ENDPOINTS = {
    // Auth
    LOGIN: "/users/login",
    LOGOUT: "/users/logout",
    // Retailer
    CREATE_RETAILER: "/retailers",
    GET_RETAILERS: "/retailers",
    GET_RETAILER_BY_ID: (id: string) => `/retailers/${id}`,
    UPDATE_RETAILER: (id: string) => `/retailers/${id}`,
    DELETE_RETAILER: (id: string) => `/retailers/${id}`,
    // Category
    CREATE_CATEGORY: "/categories",
    GET_CATEGORIES: "/categories",
    GET_CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
    UPDATE_CATEGORY: (id: string) => `/categories/${id}`,
    DELETE_CATEGORY: (id: string) => `/categories/${id}`,
    // Product
    CREATE_PRODUCT: "/products",
    GET_PRODUCTS: "/products",
    GET_PRODUCT_BY_ID: (id: string) => `/products/${id}`,
    UPDATE_PRODUCT: (id: string) => `/products/${id}`,
    DELETE_PRODUCT: (id: string) => `/products/${id}`,
    BULK_UPLOAD_PRODUCTS: "/products/bulk-upload",
} as const;
