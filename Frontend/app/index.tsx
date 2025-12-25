import { Redirect } from "expo-router";

/**
 * This is the ROOT entry point of the app.
 *
 * Right now:
 * - We ALWAYS redirect to login
 *
 * Later:
 * - This file will decide:
 *   - splash → login → admin / retailer
 *
 * IMPORTANT:
 * - Do NOT put UI here
 * - Do NOT put business logic here
 */
export default function AppEntry() {
  return <Redirect href="/(auth)/login" />;
}
