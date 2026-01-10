import { Retailer } from "@/components/admin/retailers/RetailerForm";
import { Coupon } from "@/data/coupons";
import { Category, CategoryService } from "@/services/categoryService";
import { CouponService } from "@/services/coupon.service";
import { retailerService } from "@/services/retailer.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface CouponModalProps {
    visible: boolean;
    coupon?: Coupon | null;
    categories: Category[];
    retailers: Retailer[];
    onClose: () => void;
    onSave: () => void;
}

const CouponModal = ({ visible, coupon, categories, retailers, onClose, onSave }: CouponModalProps) => {
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"FLAT" | "PERCENTAGE">("FLAT");
    const [value, setValue] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [retailerId, setRetailerId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (coupon) {
            setCode(coupon.code);
            setDiscountType(coupon.discountType);
            setValue(coupon.value.toString());
            setUsageLimit(coupon.usageLimit.toString());
            setValue(coupon.value.toString());
            setUsageLimit(coupon.usageLimit.toString());
            setDescription(coupon.description || "");
            setCategoryId(coupon.categoryId || "");
            setRetailerId(coupon.retailerId || "");
        } else {
            resetForm();
        }
    }, [coupon, visible]);

    const resetForm = () => {
        setCode("");
        setDiscountType("FLAT");
        setValue("");
        setUsageLimit("");
        setDescription("");
        setCategoryId("");
        setRetailerId("");
    };

    const handleSave = async () => {
        if (!code || !value || !usageLimit) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const couponData = {
                code,
                discountType,
                value: Number(value),
                usageLimit: Number(usageLimit),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
                description,
                categoryId: categoryId || undefined,
                retailerId: retailerId || undefined,
                isActive: true,
                usageCount: 0 // Will be ignored for update
            };

            if (coupon) {
                await CouponService.updateCoupon(coupon.id, couponData);
            } else {
                await CouponService.createCoupon(couponData);
            }
            onSave();
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to save coupon");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>{coupon ? "Edit Coupon" : "New Coupon"}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textDark} />
                        </TouchableOpacity>
                    </View>

                    <View style={modalStyles.content}>
                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.label}>Code <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={modalStyles.input}
                                value={code}
                                onChangeText={setCode}
                                autoCapitalize="characters"
                                placeholder="e.g. SAVE20"
                            />
                        </View>

                        <View style={modalStyles.row}>
                            <View style={[modalStyles.inputContainer, { flex: 1 }]}>
                                <Text style={modalStyles.label}>Type</Text>
                                <View style={modalStyles.typeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.typeBtn,
                                            discountType === "FLAT" && modalStyles.typeBtnSelected
                                        ]}
                                        onPress={() => setDiscountType("FLAT")}
                                    >
                                        <Text style={[
                                            modalStyles.typeBtnText,
                                            discountType === "FLAT" && modalStyles.typeBtnTextSelected
                                        ]}>Flat (₹)</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.typeBtn,
                                            discountType === "PERCENTAGE" && modalStyles.typeBtnSelected
                                        ]}
                                        onPress={() => setDiscountType("PERCENTAGE")}
                                    >
                                        <Text style={[
                                            modalStyles.typeBtnText,
                                            discountType === "PERCENTAGE" && modalStyles.typeBtnTextSelected
                                        ]}>Percent (%)</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[modalStyles.inputContainer, { flex: 1 }]}>
                                <Text style={modalStyles.label}>Value <Text style={{ color: 'red' }}>*</Text></Text>
                                <TextInput
                                    style={modalStyles.input}
                                    value={value}
                                    onChangeText={setValue}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.label}>Usage Limit <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={modalStyles.input}
                                value={usageLimit}
                                onChangeText={setUsageLimit}
                                keyboardType="numeric"
                                placeholder="e.g. 100"
                            />
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.label}>Description</Text>
                            <TextInput
                                style={modalStyles.input}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Short description"
                            />
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.label}>Category (Optional)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.categoryScroll}>
                                <TouchableOpacity
                                    style={[
                                        modalStyles.categoryChip,
                                        !categoryId && modalStyles.categoryChipSelected
                                    ]}
                                    onPress={() => setCategoryId("")}
                                >
                                    <Text style={[
                                        modalStyles.categoryChipText,
                                        !categoryId && modalStyles.categoryChipTextSelected
                                    ]}>All</Text>
                                </TouchableOpacity>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            modalStyles.categoryChip,
                                            categoryId === cat.id && modalStyles.categoryChipSelected
                                        ]}
                                        onPress={() => setCategoryId(cat.id)}
                                    >
                                        <Text style={[
                                            modalStyles.categoryChipText,
                                            categoryId === cat.id && modalStyles.categoryChipTextSelected
                                        ]}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.label}>Retailer (Optional)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.categoryScroll}>
                                <TouchableOpacity
                                    style={[
                                        modalStyles.categoryChip,
                                        !retailerId && modalStyles.categoryChipSelected
                                    ]}
                                    onPress={() => setRetailerId("")}
                                >
                                    <Text style={[
                                        modalStyles.categoryChipText,
                                        !retailerId && modalStyles.categoryChipTextSelected
                                    ]}>All</Text>
                                </TouchableOpacity>
                                {retailers.map((ret) => (
                                    <TouchableOpacity
                                        key={ret.id}
                                        style={[
                                            modalStyles.categoryChip,
                                            retailerId === ret.id && modalStyles.categoryChipSelected
                                        ]}
                                        onPress={() => setRetailerId(ret.id)}
                                    >
                                        <Text style={[
                                            modalStyles.categoryChipText,
                                            retailerId === ret.id && modalStyles.categoryChipTextSelected
                                        ]}>{ret.shopName}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <TouchableOpacity
                            style={modalStyles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={modalStyles.saveButtonText}>{coupon ? "Update" : "Create"}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function CouponManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [couponsData, categoriesData, retailersData] = await Promise.all([
                CouponService.getAllCoupons(),
                CategoryService.getAll(),
                retailerService.getRetailers()
            ]);
            setCoupons(couponsData);
            setCategories(flattenCategories(categoriesData));
            setRetailers(retailersData);
        } catch (error) {
            Alert.alert("Error", "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const flattenCategories = (cats: Category[]): Category[] => {
        let res: Category[] = [];
        cats.forEach(c => {
            res.push(c);
            if (c.subCategories) res.push(...flattenCategories(c.subCategories));
        });
        return res;
    };

    const handleEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setModalVisible(true);
    };

    const handleCreate = () => {
        setSelectedCoupon(null);
        setModalVisible(true);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
            await CouponService.updateCoupon(id, { isActive: !currentStatus });
        } catch (error) {
            Alert.alert("Error", "Failed to update status");
            loadData(); // Revert
        }
    };

    const renderCoupon = ({ item }: { item: Coupon }) => (
        <View style={styles.couponCard}>
            <View style={styles.couponHeader}>
                <View>
                    <Text style={styles.couponCode}>{item.code}</Text>
                    <Text style={styles.couponDesc}>
                        {item.discountType === 'FLAT' ? `₹${item.value} OFF` : `${item.value}% OFF`}
                        {item.description ? ` • ${item.description}` : ''}
                        {item.categoryId && (
                            <Text style={styles.catBadge}>
                                {" • On " + (categories.find(c => c.id === item.categoryId)?.name || "Category")}
                            </Text>
                        )}
                        {item.retailerId && (
                            <Text style={styles.catBadge}>
                                {" • For " + (retailers.find(r => r.id === item.retailerId)?.shopName || "Retailer")}
                            </Text>
                        )}
                    </Text>
                </View>
                <Switch
                    value={item.isActive}
                    onValueChange={() => handleToggleStatus(item.id, item.isActive)}
                    trackColor={{ false: "#767577", true: colors.primary }}
                />
            </View>
            <View style={styles.couponFooter}>
                <Text style={styles.usageText}>Used: {item.usageCount} / {item.usageLimit}</Text>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
                <Ionicons name="add" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>Add New Coupon</Text>
            </TouchableOpacity>

            <FlatList
                data={coupons}
                renderItem={renderCoupon}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No coupons found</Text>
                    </View>
                }
            />

            <CouponModal
                visible={modalVisible}
                coupon={selectedCoupon}
                categories={categories}
                retailers={retailers}
                onClose={() => setModalVisible(false)}
                onSave={loadData}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        flexDirection: "row",
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        gap: 8,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    couponCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    couponHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    couponCode: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 4,
    },
    couponDesc: {
        fontSize: 14,
        color: colors.textLight,
    },
    catBadge: {
        color: colors.primary,
        fontWeight: "500",
    },
    couponFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
    },
    usageText: {
        fontSize: 12,
        color: colors.textLight,
    },
    editText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primary,
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        color: colors.textLight,
    },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "80%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
    },
    content: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    typeSelector: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    typeBtn: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    typeBtnSelected: {
        backgroundColor: colors.primary,
    },
    typeBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textDark,
    },
    typeBtnTextSelected: {
        color: colors.white,
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
    categoryScroll: {
        flexDirection: "row",
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
    },
    categoryChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: colors.textDark,
    },
    categoryChipTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
});
