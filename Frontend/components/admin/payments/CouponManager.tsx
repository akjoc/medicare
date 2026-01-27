import { SearchableDropdown } from "@/components/admin/payments/SearchableDropdown";
import { Retailer } from "@/components/admin/retailers/RetailerForm";
import { Coupon } from "@/data/coupons";
import { Category, CategoryService } from "@/services/categoryService";
import { CouponService } from "@/services/coupon.service";
import { retailerService } from "@/services/retailer.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
    const [type, setType] = useState<"flat" | "percent">("flat");
    const [value, setValue] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [retailerIds, setRetailerIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (coupon) {
            setCode(coupon.code);
            setType(coupon.type);
            setValue(coupon.value.toString());
            setUsageLimit(coupon.usageLimit?.toString() || "");
            setDescription(coupon.description || "");
            setShortDescription(coupon.shortDescription || "");
            setCategoryIds(coupon.categoryIds || (coupon.categoryId ? [coupon.categoryId] : []));
            setRetailerIds(coupon.retailerIds || (coupon.retailerId ? [coupon.retailerId] : []));
        } else {
            resetForm();
        }
    }, [coupon, visible]);

    const resetForm = () => {
        setCode("");
        setType("flat");
        setValue("");
        setUsageLimit("");
        setDescription("");
        setShortDescription("");
        setCategoryIds([]);
        setRetailerIds([]);
    };

    const handleSave = async () => {
        if (!code || !type || !value) {
            Alert.alert("Error", "Coupon Name, Type and Value are mandatory");
            return;
        }

        setLoading(true);
        try {
            const couponData = {
                code,
                type,
                value: Number(value),
                usageLimit: usageLimit ? Number(usageLimit) : undefined,
                description,
                shortDescription,
                categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
                retailerIds: retailerIds.length > 0 ? retailerIds : undefined,
                isActive: coupon ? coupon.isActive : true,
            };

            if (coupon) {
                await CouponService.updateCoupon(coupon._id || coupon.id, couponData);
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

                    <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
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
                                            type === "flat" && modalStyles.typeBtnSelected
                                        ]}
                                        onPress={() => setType("flat")}
                                    >
                                        <Text style={[
                                            modalStyles.typeBtnText,
                                            type === "flat" && modalStyles.typeBtnTextSelected
                                        ]}>Flat (₹)</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.typeBtn,
                                            type === "percent" && modalStyles.typeBtnSelected
                                        ]}
                                        onPress={() => setType("percent")}
                                    >
                                        <Text style={[
                                            modalStyles.typeBtnText,
                                            type === "percent" && modalStyles.typeBtnTextSelected
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
                            <Text style={modalStyles.label}>Usage Limit</Text>
                            <TextInput
                                style={modalStyles.input}
                                value={usageLimit}
                                onChangeText={setUsageLimit}
                                keyboardType="numeric"
                                placeholder="e.g. 100"
                            />
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.label}>Short Description</Text>
                            <TextInput
                                style={modalStyles.input}
                                value={shortDescription}
                                onChangeText={setShortDescription}
                                placeholder="e.g. 50% off"
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

                        <SearchableDropdown
                            data={categories}
                            value={categoryIds?.[0] || ""}
                            onSelect={(id) => setCategoryIds(id ? [id] : [])}
                            placeholder="Category"
                            label="Category (Optional)"
                            getItemId={(cat) => cat.id}
                            getItemLabel={(cat) => cat.name}
                            allowAll={true}
                        />

                        <SearchableDropdown
                            data={retailers}
                            value={retailerIds?.[0] || ""}
                            onSelect={(id) => setRetailerIds(id ? [id] : [])}
                            placeholder="Retailer"
                            label="Retailer (Optional)"
                            getItemId={(ret) => ret.id}
                            getItemLabel={(ret) => ret.shopName}
                            allowAll={true}
                            onSearch={async (query) => {
                                const response = await retailerService.searchRetailers(query, 1, 50);
                                return response.retailers;
                            }}
                            debounceMs={500}
                        />

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
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default function CouponManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [totalCoupons, setTotalCoupons] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async (isLoadMore = false) => {
        if (!isLoadMore) {
            setLoading(true);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const nextPage = isLoadMore ? page + 1 : 1;
            const [couponsRes, categoriesData, retailersData] = await Promise.all([
                CouponService.getAllCoupons(nextPage),
                CategoryService.getAll(),
                retailerService.getRetailers()
            ]);

            if (isLoadMore) {
                setCoupons(prev => {
                    const existingIds = new Set(prev.map(c => c._id || c.id));
                    const newCoupons = couponsRes.coupons.filter(c => !existingIds.has(c._id || c.id));
                    return [...prev, ...newCoupons];
                });
                setPage(nextPage);
            } else {
                setCoupons(couponsRes.coupons);
                setPage(1);
            }

            setTotalCoupons(couponsRes.totalCoupons);
            setTotalPages(couponsRes.totalPages);
            setCategories(flattenCategories(categoriesData));
            setRetailers(retailersData.retailers);
        } catch (error) {
            Alert.alert("Error", "Failed to load data");
        } finally {
            setLoading(false);
            setLoadingMore(false);
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
            setCoupons(prev => prev.map(c => (c._id === id || c.id === id) ? { ...c, isActive: !currentStatus } : c));
            await CouponService.toggleCouponStatus(id);
        } catch (error) {
            Alert.alert("Error", "Failed to update status");
            loadData(false); // Revert
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && !loading && page < totalPages) {
            loadData(true);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Delete Coupon",
            "Are you sure you want to delete this coupon?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await CouponService.deleteCoupon(id);
                            loadData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete coupon");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderCoupon = ({ item }: { item: Coupon }) => (
        <View style={styles.couponCard}>
            <View style={styles.couponHeader}>
                <View>
                    <Text style={styles.couponCode}>{item.code}</Text>
                    <Text style={styles.couponDesc}>
                        {item.type === 'flat' ? `₹${item.value} OFF` : `${item.value}% OFF`}
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
                <View style={styles.headerRight}>
                    <Switch
                        value={item.isActive}
                        onValueChange={() => handleToggleStatus(item._id || item.id, item.isActive)}
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                    <TouchableOpacity onPress={() => handleDelete(item._id || item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={20} color="#ff4d4f" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.couponFooter}>
                <Text style={styles.usageText}>Used: {item.usageCount || 0} / {item.usageLimit || '∞'}</Text>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    if (loading && !loadingMore) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.totalCountText}>Total Coupons ({totalCoupons})</Text>
                </View>
                <TouchableOpacity style={styles.addButtonSmall} onPress={handleCreate}>
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={styles.addButtonTextSmall}>Add New</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={coupons}
                renderItem={renderCoupon}
                keyExtractor={(item) => item._id || item.id}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
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
    footerLoader: {
        paddingVertical: 20,
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
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalCountText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textDark,
    },
    addButtonSmall: {
        flexDirection: "row",
        backgroundColor: colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        gap: 4,
    },
    addButtonTextSmall: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
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
        alignItems: "center",
        marginBottom: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteBtn: {
        padding: 4,
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
});
