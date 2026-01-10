import { privateClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoint";

/**
 * Interface representing the payload for creating or updating a category.
 * Matches the backend expected structure.
 */
export interface CategoryPayload {
    name: string;
    description?: string;
    parentId?: string | null; // Optional: ID of the parent category if this is a subcategory
}

/**
 * Interface representing a Category object returned from the API.
 */
export interface Category {
    id: string; // Unique identifier for the category (MongoDB _id)
    name: string;
    description?: string;
    parentId?: string | null;
    productCount?: number; // Optional count of products in this category
    createdAt?: string;
    updatedAt?: string;
    subCategories?: Category[];
}

/**
 * Service for handling Category-related API operations.
 * Communicates with the backend to Create, Read, Update, and Delete categories.
 */
export const CategoryService = {
    /**
     * Fetches all categories from the backend.
     * Returns a nested structure (trees) where children are in `subCategories`.
     * @returns Promise resolving to an array of Category objects.
     */
    async getAll(): Promise<Category[]> {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_CATEGORIES);
            return response.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error; // Re-throw to be handled by the caller (e.g., UI component)
        }
    },

    /**
     * Fetches a specific category by its ID.
     * @param id The ID of the category to retrieve.
     * @returns Promise resolving to the Category object.
     */
    async getById(id: string): Promise<Category> {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_CATEGORY_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error(`Error fetching category with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new category.
     * @param data The payload containing category details (name, description, parentId).
     * @returns Promise resolving to the created Category object.
     */
    async create(data: CategoryPayload): Promise<Category> {
        try {
            // Ensure parentId is null if it's an empty string or undefined to avoid backend errors
            const payload = {
                ...data,
                parentId: data.parentId || null,
            };
            const response = await privateClient.post(ENDPOINTS.CREATE_CATEGORY, payload);
            return response.data;
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    },

    /**
     * Updates an existing category.
     * @param id The ID of the category to update.
     * @param data The payload containing updated fields.
     * @returns Promise resolving to the updated Category object.
     */
    async update(id: string, data: Partial<CategoryPayload>): Promise<Category> {
        try {
            const payload = {
                ...data,
                parentId: data.parentId || null,
            };
            const response = await privateClient.put(ENDPOINTS.UPDATE_CATEGORY(id), payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating category with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Deletes a category by its ID.
     * @param id The ID of the category to delete.
     * @returns Promise resolving when deletion is successful.
     */
    async delete(id: string): Promise<void> {
        try {
            const response = await privateClient.delete(ENDPOINTS.DELETE_CATEGORY(id));
            return response.data;
        } catch (error) {
            console.error(`Error deleting category with id ${id}:`, error);
            throw error;
        }
    },
};
