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
        titleContainer: {
            display: 'flex',
            flexDirection: 'row',
            marginBottom: 10,
        },
        title: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            flex: 1,
        },
        list: { width: '95%' },
        itemContainer: {
            flexDirection: 'row',
            marginTop: 1,
            marginLeft: 1,
        },
        itemDisplay: { marginLeft: 5 },
        doneButton: {
            marginTop: 10,
        },
    })

    return (
        <BaseModal visible={visible} onClose={onDone}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <SecondaryButton
                    text="clear"
                    onPress={async () => {
                        onClear()
                    }}
                />
            </View>
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
                                tintColors={{
                                    true: colors.textPrimary,
                                    false: colors.gray,
                                }}
                                boxType="square"
                                tintColor={colors.gray}
                                onFillColor={colors.textPrimary}
                                onCheckColor={colors.primary}
                                onTintColor={colors.textPrimary}
                                onAnimationType="bounce"
                                offAnimationType="bounce"
                                testID={`checkbox-${index}`}
                            />
                            <Text style={styles.itemDisplay}>{display}</Text>
                        </View>
                    )
                }}
            />

            <PrimaryButton
                style={styles.doneButton}
                text="done"
                loading={false}
                onPress={onDone}
            />
        </BaseModal>
    )
}

export default StatsFilterModal
