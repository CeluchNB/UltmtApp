import BaseModal from '../atoms/BaseModal'
import CheckBox from '@react-native-community/checkbox'
import PrimaryButton from '../atoms/PrimaryButton'
import SecondaryButton from '../atoms/SecondaryButton'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { ReactNode } from 'react'

export interface CheckBoxItem {
    display: string | ReactNode
    value: string
    checked: boolean
}

interface StatsFilterModalProps {
    title: string
    data: CheckBoxItem[]
    visible: boolean
    onSelect: (value: string) => void
    onClear: () => void
    onDone: () => void
}

const StatsFilterModal: React.FC<StatsFilterModalProps> = ({
    title,
    data,
    visible,
    onSelect,
    onClear,
    onDone,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const styles = StyleSheet.create({
        title: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            marginBottom: 10,
        },
        list: { width: '100%' },
        itemContainer: {
            flexDirection: 'row',
        },
        clearButton: {
            marginBottom: 10,
        },
    })

    return (
        <BaseModal visible={visible} onClose={onDone}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
                data={data}
                style={styles.list}
                renderItem={({ item: { display, value, checked }, index }) => {
                    return (
                        <View style={styles.itemContainer}>
                            <CheckBox
                                value={checked}
                                onChange={() => {
                                    onSelect(value)
                                }}
                                onValueChange={() => {
                                    console.log('on value change')
                                }}
                                tintColors={{
                                    true: colors.textPrimary,
                                    false: colors.gray,
                                }}
                                onFillColor={colors.textPrimary}
                                onCheckColor={colors.textPrimary}
                                testID={`checkbox-${index}`}
                            />
                            <Text>{display}</Text>
                        </View>
                    )
                }}
            />
            <SecondaryButton
                text="clear all"
                style={styles.clearButton}
                onPress={async () => {
                    onClear()
                }}
            />
            <PrimaryButton text="done" loading={false} onPress={onDone} />
        </BaseModal>
    )
}

export default StatsFilterModal
