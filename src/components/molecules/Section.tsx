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
    buttonText,
    error,
    showCreateButton = false,
    onCreatePress = () => {},
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            width: '100%',
        },
        titleContainer: {
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
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <IconButton
                    color={colors.primary}
                    style={styles.createButton}
                    onPress={onCreatePress}
                    icon="plus"
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
            {!error && (
                <Button
                    mode="text"
                    style={styles.button}
                    color={colors.textPrimary}
                    onPress={onButtonPress}>
                    {buttonText}
                </Button>
            )}
        </View>
    )
}

export default Section
