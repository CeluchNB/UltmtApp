import * as React from 'react'
import { useColors } from '../../hooks'
import { Button, IconButton } from 'react-native-paper'
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface SectionProps {
    title: string
    onButtonPress: () => void
    numColumns?: number
    listData: any[]
    renderItem: ListRenderItem<any>
    showButton: boolean
    buttonText: string
    error?: string
    showCreateButton?: boolean
    onCreatePress?: () => void
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
    showCreateButton = false,
    onCreatePress = () => {},
}) => {
    const { colors } = useColors()

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
            fontSize: size.fontLarge,
            color: colors.textPrimary,
            fontWeight: weight.bold,
            marginBottom: 10,
            flex: 1,
        },
        createButton: {
            display: !showCreateButton ? 'none' : 'flex',
            flexWrap: 'nowrap',
            backgroundColor: colors.textPrimary,
            borderRadius: 5,
        },
        list: {},
        button: {
            alignSelf: 'center',
            marginTop: 10,
        },
        error: {
            fontSize: size.fontMedium,
            marginBottom: 50,
            color: colors.textPrimary,
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <IconButton
                    iconColor={colors.primary}
                    style={styles.createButton}
                    onPress={onCreatePress}
                    icon="plus"
                    disabled={!showCreateButton}
                    testID="create-button"
                />
            </View>
            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <FlatList
                    listKey={title}
                    data={listData}
                    scrollEnabled={false}
                    numColumns={numColumns}
                    renderItem={renderItem}
                />
            )}
            {showButton && (
                <Button
                    mode="text"
                    style={styles.button}
                    uppercase={true}
                    textColor={colors.textPrimary}
                    onPress={onButtonPress}>
                    {buttonText}
                </Button>
            )}
        </View>
    )
}

export default Section
