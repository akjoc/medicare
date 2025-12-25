/**
 * Mock users for development only.
 * This simulates backend login response.
 */

export type UserRole = "admin" | "retailer";

export interface MockUser {
  id: number;
  name: string;
  role: UserRole;
  email: string;
}

export const mockUsers = {
  admin: {
    id: 1,
    name: "Admin User",
    role: "admin",
    email: "admin@medicare.com",
  },
  retailer: {
    id: 2,
    name: "Retailer User",
    role: "retailer",
    email: "retailer@medicare.com",
  },
};
