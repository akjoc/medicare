import { Retailer } from "@/components/admin/retailers/RetailerForm";

/**
 * Mock data for retailers.
 * In a real application, this data would be fetched from an API.
 */
export const MOCK_RETAILERS: Retailer[] = [
    {
        id: "1",
        name: "John Doe",
        shopName: "Medicare Pharmacy",
        email: "john@medicare.com",
        phone: "9876543210",
        address: "123 Main St, New York, NY 10001",
        status: "active" as const,
        joinedDate: "2024-01-15",
        gst: "29AAAAA0000A1Z5",
        licenseNumber: "DL-1234567890",
    },
    {
        id: "2",
        name: "Jane Smith",
        shopName: "City Health Store",
        email: "jane@cityhealth.com",
        phone: "9876500000",
        address: "456 Market St, San Francisco, CA 94105",
        status: "inactive" as const,
        joinedDate: "2024-02-20",
        gst: "29BBBBB0000B1Z5",
        licenseNumber: "DL-0987654321",
    },
    {
        id: "3",
        name: "Robert Johnson",
        shopName: "Wellness Chemist",
        email: "robert@wellness.com",
        phone: "9800043210",
        address: "789 Broadway, Los Angeles, CA 90015",
        status: "active",
        joinedDate: "2024-03-10",
        gst: "29CCCCC0000C1Z5",
        licenseNumber: "DL-1122334455",
    },
];
