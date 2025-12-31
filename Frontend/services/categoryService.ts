import { Category, MOCK_CATEGORIES } from "@/data/mockProducts";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let categories = [...MOCK_CATEGORIES];

export const CategoryService = {
    async getAll(): Promise<Category[]> {
        await delay(500);
        return [...categories];
    },

    async getById(id: string): Promise<Category | undefined> {
        await delay(300);
        return categories.find((c) => c.id === id);
    },

    async create(data: Omit<Category, "id" | "productCount">): Promise<Category> {
        await delay(800);
        const newCategory: Category = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            productCount: 0,
        };
        categories.push(newCategory);
        return newCategory;
    },

    async update(id: string, data: Partial<Category>): Promise<Category> {
        await delay(800);
        const index = categories.findIndex((c) => c.id === id);
        if (index === -1) throw new Error("Category not found");

        categories[index] = { ...categories[index], ...data };
        return categories[index];
    },

    async delete(id: string): Promise<void> {
        await delay(600);
        categories = categories.filter((c) => c.id !== id);
    },
};
