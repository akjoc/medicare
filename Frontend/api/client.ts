import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";

export const BASE_URL = "http://185.199.53.90:5000/api";

export const AUTH_TOKEN_KEY = "auth_token";
export const USER_INFO_KEY = "user_info";

// Client for public APIs (Auth, etc.)
export const publicClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Client for protected APIs
export const privateClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add the auth token to protected requests
privateClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                // Assuming Bearer token format. Setup can be adjusted if backend differs.
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error reading auth token", error);
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Private client handles auth expiration and global errors
privateClient.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        if (!error.response) {
            Alert.alert("Network Error", "Please check your internet connection.");
            return Promise.reject(error);
        }

        const { status } = error.response;

        if (status === 401) {
            // Token expired
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            await AsyncStorage.removeItem(USER_INFO_KEY);

            Alert.alert("Session Expired", "Please login again.");

            // Use replace to prevent going back to the protected screen
            router.replace("/(auth)/login");

            return Promise.reject(error);
        }

        if (status === 403) {
            Alert.alert("Access Denied", "You do not have permission to view this resource.");
        }

        if (status === 404) {
            Alert.alert("Not Found", "The requested resource was not found.");
        }

        if (status === 500) {
            Alert.alert("Server Error", "Something went wrong on the server.");
        }

        return Promise.reject(error);
    }
);
