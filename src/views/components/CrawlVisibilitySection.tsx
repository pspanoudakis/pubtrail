import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import { COLORS } from "@/styles/theme";

type CrawlVisibilitySectionProps = {
    isPublic: boolean,
    onIsPublicChange?: (next: boolean) => void,
    isEditable: boolean
};

export function CrawlVisibilitySection({
    isPublic,
    onIsPublicChange,
    isEditable,
}: CrawlVisibilitySectionProps) {
    return (
        <View style={styles.container}>{
            isEditable ? <>
                <Text style={commonStyles.sectionTitle}>Crawl Visibility</Text>
                <Text style={commonStyles.subtleText}>
                    Control whether non-participants can see this crawl
                </Text>

                <View style={styles.segmentControl}>
                    <TouchableOpacity
                        style={[styles.segment, isPublic ? styles.segmentSelectedPublic : styles.segmentUnselected]}
                        onPress={() => onIsPublicChange?.(true)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isPublic }}
                    >
                        <Text style={[styles.segmentText, isPublic ? styles.segmentTextSelected : styles.segmentTextUnselected]}>🌍 Public</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segment, !isPublic ? styles.segmentSelectedPrivate : styles.segmentUnselected]}
                        onPress={() => onIsPublicChange?.(false)}
                    >
                        <Text style={[styles.segmentText, !isPublic ? styles.segmentTextSelected : styles.segmentTextUnselected]}>🔒 Private</Text>
                    </TouchableOpacity>
                </View>
            </> : <>
                <Text style={commonStyles.sectionTitle}>{
                    isPublic ? "Public Crawl" : "Private Crawl"    
                }</Text>
                <Text style={commonStyles.subtleText}>{
                    isPublic ? "This crawl is visible to all nearby users" :
                    "This crawl is only visible to participant users"
                }</Text>
            </>
        }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    segmentControl: {
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 12,
        marginBottom: 16,
        width: '100%',
        backgroundColor: '#f2f2f2',
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 12,
    },
    segmentUnselected: {
        backgroundColor: '#f8f9fa',
    },
    segmentSelectedPublic: {
        backgroundColor: COLORS.success,
    },
    segmentSelectedPrivate: {
        backgroundColor: COLORS.error,
    },
    iconDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    segmentText: {
        fontWeight: '600',
    },
    segmentTextSelected: {
        color: 'white',
    },
    segmentTextUnselected: {
        color: '#222',
    },
});

