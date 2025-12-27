//Version 1
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { Pressable, StyleSheet, Text, View } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { APP_CONFIG } from "@/constants/app";
// import { colors } from "@/styles/colors";
// import { spacing } from "@/styles/spacing";
// import { typography } from "@/styles/typography";

// type AppHeaderProps = {
//     /** Show back button or not */
//     showBack?: boolean;

//     /** Title for inner screens */
//     title?: string;
// };

// export default function AppHeader({
//     showBack = false,
//     title,
// }: AppHeaderProps) {
//     const insets = useSafeAreaInsets();
//     const router = useRouter();

//     return (
//         <View
//             style={[
//                 styles.container,
//                 { paddingTop: insets.top },
//             ]}
//         >
//             {/* LEFT SIDE */}
//             <View style={styles.left}>
//                 {showBack && (
//                     <Pressable
//                         onPress={() => router.back()}
//                         style={styles.backButton}
//                     >
//                         <Ionicons
//                             name="arrow-back"
//                             size={22}
//                             color={colors.white}
//                         />
//                     </Pressable>
//                 )}
//             </View>

//             {/* CENTER */}
//             <View style={styles.center}>
//                 {showBack ? (
//                     <Text
//                         style={styles.title}
//                         numberOfLines={1}
//                     >
//                         {title}
//                     </Text>
//                 ) : (
//                     <>
//                         {/* LOGO IMAGE (ENABLE LATER) */}
//                         {/*
//             <Image
//               source={require("@/assets/logo.png")}
//               style={styles.logo}
//               resizeMode="contain"
//             />
//             */}

//                         <Text style={styles.appName}>
//                             {APP_CONFIG.NAME}
//                         </Text>
//                     </>
//                 )}
//             </View>

//             {/* RIGHT SIDE (RESERVED FOR FUTURE ICONS) */}
//             <View style={styles.right} />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: colors.primary,
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: spacing.md,
//         paddingBottom: spacing.sm,
//     },

//     left: {
//         width: 40,
//         alignItems: "flex-start",
//         justifyContent: "center",
//     },

//     center: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center",
//     },

//     right: {
//         width: 40,
//     },

//     backButton: {
//         padding: spacing.xs,
//     },

//     appName: {
//         color: colors.white,
//         ...typography.title,
//     },

//     title: {
//         color: colors.white,
//         ...typography.label,
//     },

//     /*
//     logo: {
//       height: 28,
//       width: 120,
//     },
//     */
// });




//Version 2
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { Pressable, StyleSheet, Text, View } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { APP_CONFIG } from "@/constants/app";
// import { colors } from "@/styles/colors";
// import { spacing } from "@/styles/spacing";
// import { typography } from "@/styles/typography";

// type AppHeaderProps = {
//     showBack?: boolean;
//     title?: string;
// };

// export default function AppHeader({
//     showBack = false,
//     title,
// }: AppHeaderProps) {
//     const insets = useSafeAreaInsets();
//     const router = useRouter();

//     return (
//         <View
//             style={[
//                 styles.wrapper,
//                 { paddingTop: insets.top },
//             ]}
//         >
//             <View style={styles.container}>
//                 {/* LEFT */}
//                 <View style={styles.left}>
//                     {showBack && (
//                         <Pressable
//                             onPress={() => router.back()}
//                             style={styles.backButton}
//                             hitSlop={10}
//                         >
//                             <Ionicons
//                                 name="arrow-back"
//                                 size={22}
//                                 color={colors.textDark}
//                             />
//                         </Pressable>
//                     )}
//                 </View>

//                 {/* CENTER / TITLE */}
//                 <View style={styles.center}>
//                     {showBack ? (
//                         <Text
//                             style={styles.title}
//                             numberOfLines={1}
//                         >
//                             {title}
//                         </Text>
//                     ) : (
//                         <View>
//                             <Text style={styles.appName}>
//                                 {APP_CONFIG.NAME}
//                             </Text>
//                             <Text style={styles.tagline}>
//                                 {APP_CONFIG.TAGLINE}
//                             </Text>
//                         </View>
//                     )}
//                 </View>

//                 {/* RIGHT (reserved) */}
//                 <View style={styles.right} />
//             </View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     wrapper: {
//         backgroundColor: colors.white,
//         borderBottomWidth: 1,
//         borderBottomColor: colors.border,
//     },

//     container: {
//         height: 64,
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: spacing.md,
//     },

//     left: {
//         width: 40,
//         justifyContent: "center",
//     },

//     center: {
//         flex: 1,
//         justifyContent: "center",
//     },

//     right: {
//         width: 40,
//     },

//     backButton: {
//         padding: spacing.xs,
//         borderRadius: 20,
//     },

//     appName: {
//         ...typography.title,
//         color: colors.primary,
//     },

//     tagline: {
//         fontSize: 12,
//         color: colors.textLight,
//         marginTop: 2,
//     },

//     title: {
//         ...typography.label,
//         color: colors.textDark,
//     },
// });



//Version 3
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APP_CONFIG } from "@/constants/app";
import { colors } from "@/styles/colors";
import { spacing } from "@/styles/spacing";
import { typography } from "@/styles/typography";

type AppHeaderProps = {
    showBack?: boolean;
    title?: string;
};

export default function AppHeader({
    showBack = false,
    title,
}: AppHeaderProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top }]}>
            <View style={styles.container}>
                {/* LEFT */}
                <View style={styles.left}>
                    {showBack && (
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backButton}
                            hitSlop={10}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color={colors.textDark}
                            />
                        </Pressable>
                    )}
                </View>

                {/* CENTER */}
                <View style={styles.center}>
                    {showBack ? (
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                    ) : (
                        <>
                            <Text style={styles.appName}>
                                {APP_CONFIG.NAME}
                            </Text>
                            <Text style={styles.tagline}>
                                {APP_CONFIG.TAGLINE}
                            </Text>
                        </>
                    )}
                </View>

                {/* RIGHT (future actions) */}
                <View style={styles.right} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#FAFAFA",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 3, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },

    container: {
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
    },

    left: {
        width: 40,
        justifyContent: "center",
    },

    center: {
        flex: 1,
        justifyContent: "center",
    },

    right: {
        width: 40,
    },

    backButton: {
        padding: spacing.xs,
        borderRadius: 20,
    },

    appName: {
        ...typography.title,
        color: colors.primary,
        fontWeight: "700",
    },

    tagline: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },

    title: {
        ...typography.label,
        fontWeight: "600",
        color: colors.textDark,
    },
});
