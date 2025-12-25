import { MockUser, mockUsers, UserRole } from "../data/auth";

/**
 * Simulates login.
 * Later this will call backend API.
 */
export async function loginAs(role: UserRole): Promise<MockUser> {
  // simulate API delay
  await new Promise((res) => setTimeout(res, 500));

  return mockUsers[role];
}
