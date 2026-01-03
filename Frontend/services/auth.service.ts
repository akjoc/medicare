import { AUTH_TOKEN_KEY, privateClient, publicClient, USER_INFO_KEY } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "retailer";
  token?: string;
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await publicClient.post(ENDPOINTS.LOGIN, {
      email,
      password,
    });

    const user = response.data;



    if (user.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, user.token);
    }
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(user));

    return user;
  } catch (error) {
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await privateClient.post(ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error("Logout API call failed", error);
  } finally {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_INFO_KEY);
  }
}

export async function getUser(): Promise<User | null> {
  const json = await AsyncStorage.getItem(USER_INFO_KEY);
  return json ? JSON.parse(json) : null;
}
