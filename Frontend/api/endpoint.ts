export const ENDPOINTS = {
    // Auth
    LOGIN: "/users/login",
    LOGOUT: "/users/logout",
    CHANGE_PASSWORD: "/users/change-password",
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
    // Coupon
    CREATE_COUPON: "/coupons",
    GET_COUPONS: "/coupons",
    UPDATE_COUPON: (id: string) => `/coupons/${id}`,
    TOGGLE_COUPON_STATUS: (id: string) => `/coupons/${id}/status`,
    DELETE_COUPON: (id: string) => `/coupons/${id}`,
    // Payment Configuration
    GET_PAYMENT_CONFIG: "/payment-config",
    UPDATE_PAYMENT_CONFIG: "/payment-config",
} as const;
