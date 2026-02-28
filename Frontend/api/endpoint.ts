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
    DELETE_ALL_PRODUCTS: "/products/delete-all",
    BULK_UPLOAD_PRODUCTS: "/products/bulk-upload",
    // Coupon
    CREATE_COUPON: "/coupons",
    GET_COUPONS: "/coupons",
    UPDATE_COUPON: (id: string) => `/coupons/${id}`,
    TOGGLE_COUPON_STATUS: (id: string) => `/coupons/${id}/status`,
    DELETE_COUPON: (id: string) => `/coupons/${id}`,
    APPLY_COUPON: "/coupons/apply",
    // Payment Configuration
    GET_PAYMENT_CONFIG: "/payment-config",
    UPDATE_PAYMENT_CONFIG: "/payment-config",
    GET_PAYMENT_CONFIG_RETAILER: "/payment-config/retailer",
    //Cart functionality
    ADD_TO_CART: "/cart/add",
    GET_CART: "/cart",
    UPDATE_CART: "/cart/update",
    REMOVE_SPECIFIC_ITEM_FROM_CART: (id: string) => `/cart/remove/${id}`,
    CLEAR_CART: "/cart/clear",
    //Order functionality
    CREATE_ORDER: "/orders/place",
    GET_ALL_ORDERS: "/orders/all",
    GET_USER_ORDERS: "/orders",
    GET_ORDER_BY_ID: (id: string) => `/orders/${id}`,
    UPDATE_ORDER_STATUS: (id: string) => `/orders/${id}/status`,
    UPLOAD_ORDER_INVOICE: (id: string) => `/orders/${id}/invoice`,
    UPDATE_PAYMENT_STATUS: (id: string) => `/orders/${id}/payment-status`,
    //Rating Functionality
    ORDER_RETAILER_RATING: (id: string) => `orders/${id}/rate`,
    //Company Functionality
    CREATE_COMPANY: "/companies",
    GET_COMPANIES: "/companies",
    GET_COMPANY_BY_ID: (id: string) => `/companies/${id}`,
    UPDATE_COMPANY: (id: string) => `/companies/${id}`,
    DELETE_COMPANY: (id: string) => `/companies/${id}`,
    //App Settings
    GET_APP_SETTINGS: "/app-settings",
    UPDATE_APP_SETTINGS: "/app-settings",
} as const;
