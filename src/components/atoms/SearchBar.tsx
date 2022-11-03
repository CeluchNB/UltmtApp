import React from 'react'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { Button, TextInput } from 'react-native-paper'
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native'

interface SearchBarProps {
    placeholder: string
    style?: StyleProp<TextStyle>
    focusable?: boolean
    filter?: boolean
    value?: string
    onChangeText?: (text: string) => void
    onPress?: () => void
    onFilterPress?: () => void
}

const SearchBar: React.FC<SearchBarProps> = props => {
    const { colors } = useColors()
    const {
        placeholder,
        style,
        focusable = true,
        filter = false,
        value,
        onChangeText,
        onPress,
        onFilterPress,
    } = props

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            width: '90%',
            alignSelf: 'center',
        },
        input: {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            marginBottom: 5,
            fontSize: size.fontMedium,
            flex: 1,
        },
        filter: {
            marginStart: 5,
            alignSelf: 'center',
            borderColor: colors.textPrimary,
        },
    })

    return (
        <View style={styles.container}>
            <TextInput
                mode="flat"
                style={[styles.input, style]}
                underlineColor={colors.textPrimary}
                activeUnderlineColor={colors.textPrimary}
                placeholderTextColor={colors.gray}
                theme={{
                    colors: {
                        text: colors.textPrimary,
                    },
                }}
                placeholder={placeholder}
                onChangeText={onChangeText}
                onPressOut={() => {
                    if (onPress) {
                        onPress()
                    }
                }}
                value={value}
                focusable={focusable}
            />
            {filter && (
                <Button
                    mode="outlined"
                    style={styles.filter}
                    color={colors.textPrimary}
                    onPress={onFilterPress}>
                    Filter
                </Button>
            )}
        </View>
    )
}

export default SearchBar
