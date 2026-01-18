import { MOCK_PRODUCTS } from "./mockProducts";

export type OrderStatus =
    | "Awaiting Payment Confirmation"
    | "Processing"
    | "Packed"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled";

export type PaymentMethod = "COD" | "UPI" | "Bank Transfer";

export interface OrderProduct {
    productId: string;
    variantId?: string; // Optional if you have variants
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    retailerId: string;
    retailerName: string;
    shopName: string;
    date: string;
    status: OrderStatus;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    items: OrderProduct[];
    // Specific to Advance Payment
    paymentProofUrl?: string; // Mock URL for screenshot
    paymentTransactionId?: string;
}

// Hardcoded retailer data to avoid circular dependency or initialization order issues
const RETAILER_1 = { id: "1", name: "John Doe", shopName: "Medicare Pharmacy" };
const RETAILER_2 = { id: "2", name: "Jane Smith", shopName: "City Health Store" };
const RETAILER_3 = { id: "3", name: "Robert Johnson", shopName: "Wellness Chemist" };

export const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-001",
        retailerId: RETAILER_1.id,
        retailerName: RETAILER_1.name,
        shopName: RETAILER_1.shopName,
        date: "2024-03-10T10:30:00Z",
        status: "Processing",
        totalAmount: 1540,
        paymentMethod: "COD",
        items: [
            {
                productId: MOCK_PRODUCTS[0]?.id || "PROD-001",
                name: MOCK_PRODUCTS[0]?.name || "Paracetamol",
                quantity: 2,
                price: MOCK_PRODUCTS[0]?.price || 50,
            },
            {
                productId: MOCK_PRODUCTS[1]?.id || "PROD-002",
                name: MOCK_PRODUCTS[1]?.name || "Amoxicillin",
                quantity: 1,
                price: MOCK_PRODUCTS[1]?.price || 120,
            },
        ],
    },
    {
        id: "ORD-002",
        retailerId: RETAILER_2.id,
        retailerName: RETAILER_2.name,
        shopName: RETAILER_2.shopName,
        date: "2024-03-11T14:15:00Z",
        status: "Awaiting Payment Confirmation",
        totalAmount: 5000,
        paymentMethod: "UPI",
        paymentProofUrl: "https://via.placeholder.com/150",
        items: [
            {
                productId: MOCK_PRODUCTS[1]?.id || "PROD-002",
                name: MOCK_PRODUCTS[1]?.name || "Amoxicillin",
                quantity: 10,
                price: MOCK_PRODUCTS[1]?.price || 120,
            },
        ],
    },
    {
        id: "ORD-003",
        retailerId: RETAILER_1.id,
        retailerName: RETAILER_1.name,
        shopName: RETAILER_1.shopName,
        date: "2024-03-09T09:00:00Z",
        status: "Packed",
        totalAmount: 2500,
        paymentMethod: "Bank Transfer",
        paymentTransactionId: "TXN123456789",
        items: [
            {
                productId: MOCK_PRODUCTS[2]?.id || "PROD-003",
                name: MOCK_PRODUCTS[2]?.name || "Cetirizine",
                quantity: 5,
                price: MOCK_PRODUCTS[2]?.price || 30,
            },
        ],
    },
    {
        id: "ORD-004",
        retailerId: RETAILER_3.id,
        retailerName: RETAILER_3.name,
        shopName: RETAILER_3.shopName,
        date: "2024-03-08T18:45:00Z",
        status: "Delivered",
        totalAmount: 1200,
        paymentMethod: "COD",
        items: [
            {
                productId: MOCK_PRODUCTS[0]?.id || "PROD-001",
                name: MOCK_PRODUCTS[0]?.name || "Paracetamol",
                quantity: 4,
                price: MOCK_PRODUCTS[0]?.price || 50,
            },
        ],
    },
    {
        id: "ORD-005",
        retailerId: RETAILER_2.id,
        retailerName: RETAILER_2.name,
        shopName: RETAILER_2.shopName,
        date: "2024-03-12T11:20:00Z",
        status: "Awaiting Payment Confirmation",
        totalAmount: 8500,
        paymentMethod: "Bank Transfer",
        items: [
            {
                productId: MOCK_PRODUCTS[0]?.id || "PROD-001",
                name: MOCK_PRODUCTS[0]?.name || "Paracetamol",
                quantity: 20,
                price: MOCK_PRODUCTS[0]?.price || 50,
            },
        ],
    },
];
