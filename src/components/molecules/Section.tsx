import * as React from 'react'
import { Button } from 'react-native-paper'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    StyleSheet,
    Text,
    View,
} from 'react-native'

interface SectionProps {
    title: string
    onButtonPress: () => void
    numColumns?: number
    listData: any[]
    renderItem: ListRenderItem<any>
    showButton: boolean
    buttonText: string
    loading?: boolean
    error?: string
}

const Section: React.FC<SectionProps> = ({
    title,
    onButtonPress,
    numColumns = 1,
    listData,
    renderItem,
    showButton,
    buttonText,
    error,
    loading = false,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            flex: 0,
            flexShrink: 1,
        },
        titleContainer: {
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
        },
        title: {
            fontSize: size.fontThirty,
            color: colors.textPrimary,
            fontWeight: weight.bold,
            marginBottom: 10,
            flex: 1,
        },
        list: {},
        button: {
            alignSelf: 'center',
            marginTop: 10,
        },
        error: {
            fontSize: size.fontTwenty,
            marginBottom: 50,
            color: colors.textPrimary,
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>
            {!loading && error && <Text style={styles.error}>{error}</Text>}
            {!loading && !error && (
                <FlatList
                    data={listData}
                    scrollEnabled={false}
                    numColumns={numColumns}
                    renderItem={renderItem}
                />
            )}
            {!loading && showButton && (
                <Button
                    mode="text"
                    style={styles.button}
                    uppercase={true}
                    textColor={colors.textSecondary}
                    onPress={onButtonPress}>
                    {buttonText}
                </Button>
            )}
            {loading && (
                <ActivityIndicator
                    size="large"
                    color={colors.textPrimary}
                    animating={loading}
                />
            )}
        </View>
    )
}

export default Section
