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
    salt?: string; // Chemical composition
    categoryId: string;
    price: number;
    salePrice?: number;
    stock: number;
    description: string;
    images: string[];
    sku: string;
    status: "active" | "inactive" | "out_of_stock";
    createdAt: string;
}

export const MOCK_CATEGORIES: Category[] = [
    {
        id: "1",
        name: "Medicine",
        description: "All kinds of medicines",
        parentId: null,
        productCount: 150,
        status: "active",
    },
    {
        id: "2",
        name: "Healthcare",
        description: "Healthcare devices and aids",
        parentId: null,
        productCount: 45,
        status: "active",
    },
    {
        id: "3",
        name: "Tablets",
        description: "Oral tablets",
        parentId: "1", // Sub-category of Medicine
        productCount: 80,
        status: "active",
    },
    {
        id: "4",
        name: "Syrups",
        description: "Liquid medicines",
        parentId: "1",
        productCount: 30,
        status: "active",
    },
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: "101",
        name: "Paracetamol 500mg",
        salt: "Acetaminophen",
        categoryId: "3", // Tablets
        price: 50,
        salePrice: 45,
        stock: 500,
        description: "Effective for fever and pain relief.",
        images: ["https://example.com/para.jpg"],
        sku: "MED-001",
        status: "active",
        createdAt: "2024-01-10",
    },
    {
        id: "102",
        name: "Cough Syrup",
        salt: "Dextromethorphan Hydrobromide",
        categoryId: "4", // Syrups
        price: 120,
        stock: 100,
        description: "Relief from dry and wet cough.",
        images: ["https://example.com/syrup.jpg"],
        sku: "MED-002",
        status: "active",
        createdAt: "2024-01-12",
    },
    {
        id: "103",
        name: "Digital Thermometer",
        // No salt for devices
        categoryId: "2", // Healthcare
        price: 800,
        salePrice: 650,
        stock: 20,
        description: "Accurate body temperature measurement.",
        images: ["https://example.com/them.jpg"],
        sku: "DEV-001",
        status: "out_of_stock",
        createdAt: "2024-02-01",
    },
    {
        id: "104",
        name: "Dolo 500mg",
        salt: "Acetaminophen",
        categoryId: "1", // Medicine
        price: 50,
        salePrice: 45,
        stock: 500,
        description: "Effective for fever and pain relief.",
        images: ["https://example.com/para.jpg"],
        sku: "MED-003",
        status: "active",
        createdAt: "2024-01-10",
    },
    {
        id: "105",
        name: "Bilajen 500mg",
        salt: "Acetaminophen",
        categoryId: "1", // Medicine
        price: 50,
        salePrice: 45,
        stock: 500,
        description: "Effective for fever and pain relief.",
        images: [],
        sku: "MED-004",
        status: "active",
        createdAt: "2024-01-10",
    },
];
