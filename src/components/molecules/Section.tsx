import * as React from 'react'
import { Button } from 'react-native-paper'
import { useColors } from '../../hooks'
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface SectionProps {
    title: string
    onButtonPress: () => void
    listData: any[]
    renderItem: ListRenderItem<any>
    buttonText: string
    error?: string
}

const Section: React.FC<SectionProps> = ({
    title,
    onButtonPress,
    listData,
    renderItem,
    buttonText,
    error,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            width: '70%',
        },
        title: {
            fontSize: size.fontLarge,
            color: colors.textPrimary,
            fontWeight: weight.bold,
            marginBottom: 10,
        },
        list: {},
        button: {
            alignSelf: 'center',
            marginTop: 10,
        },
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {error ? (
                <Text>{error}</Text>
            ) : (
                <FlatList data={listData} renderItem={renderItem} />
            )}
            <Button
                mode="text"
                style={styles.button}
                color={colors.textPrimary}
                onPress={onButtonPress}>
                {buttonText}
            </Button>
        </View>
    )
}

export default Section
