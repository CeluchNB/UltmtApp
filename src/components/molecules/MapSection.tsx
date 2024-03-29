import * as React from 'react'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button, IconButton } from 'react-native-paper'

interface MapSectionProps<T> {
    title?: string
    listData?: T[]
    renderItem: (item: T) => JSX.Element
    showButton: boolean
    showCreateButton: boolean
    loading?: boolean
    buttonText?: string
    onButtonPress?: () => void
    onCreatePress?: () => void
    error?: string
}

const MapSection = <T,>({
    title,
    listData,
    renderItem,
    showButton,
    showCreateButton,
    loading,
    buttonText,
    onButtonPress,
    onCreatePress,
    error,
}: MapSectionProps<T>) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            width: '100%',
        },
        titleContainer: {
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
        },
        createButton: {
            display: 'flex',
            flexWrap: 'nowrap',
            backgroundColor: colors.textPrimary,
            borderRadius: 5,
        },
        title: {
            flex: 1,
            fontSize: size.fontThirty,
            color: colors.textPrimary,
            fontWeight: weight.bold,
            marginBottom: 10,
        },
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
                {title && <Text style={styles.title}>{title}</Text>}
                {showCreateButton && (
                    <IconButton
                        iconColor={colors.primary}
                        style={styles.createButton}
                        onPress={onCreatePress}
                        icon="plus"
                        testID="create-button"
                    />
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            {!error &&
                !loading &&
                listData &&
                listData.map(item => renderItem(item))}
            {loading && (
                <ActivityIndicator
                    size="large"
                    color={colors.textPrimary}
                    animating={loading}
                />
            )}
            {showButton && (
                <Button
                    mode="text"
                    style={styles.button}
                    uppercase={true}
                    textColor={colors.textSecondary}
                    onPress={onButtonPress}
                    testID="more-button">
                    {buttonText}
                </Button>
            )}
        </View>
    )
}

export default MapSection
