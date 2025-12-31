import { MOCK_PRODUCTS, Product } from "@/data/mockProducts";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let products = [...MOCK_PRODUCTS];

export const ProductService = {
    async getAll(): Promise<Product[]> {
        await delay(500);
        return [...products];
    },

    async getById(id: string): Promise<Product | undefined> {
        await delay(300);
        return products.find((p) => p.id === id);
    },

    async create(data: Omit<Product, "id" | "createdAt">): Promise<Product> {
        await delay(800);
        const newProduct: Product = {
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            ...data,
        };
        products.unshift(newProduct); // Add to top
        return newProduct;
    },

    async update(id: string, data: Partial<Product>): Promise<Product> {
        await delay(800);
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Product not found");

        products[index] = { ...products[index], ...data };
        return products[index];
    },

    async delete(id: string): Promise<void> {
        await delay(600);
        products = products.filter((p) => p.id !== id);
    },

    async bulkUpload(
        file: any,
        onProgress: (progress: number) => void
    ): Promise<void> {
        // Simulate file processing with progress events
        for (let i = 0; i <= 100; i += 10) {
            await delay(200); // 2 seconds total roughly
            onProgress(i / 100);
        }

        // Mock creating some products from "file"
        const mockNewProduct: Product = {
            id: Math.random().toString(36).substr(2, 9),
            name: "Imported Product " + Math.floor(Math.random() * 1000),
            categoryId: "1",
            price: 100,
            stock: 50,
            description: "Imported via Excel",
            images: [],
            sku: "IMP-" + Math.floor(Math.random() * 10000),
            status: "active",
            createdAt: new Date().toISOString(),
        };
        products.unshift(mockNewProduct);
    }
};
