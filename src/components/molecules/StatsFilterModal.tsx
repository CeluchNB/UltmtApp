import BaseModal from '../atoms/BaseModal'
import CheckBox from '@react-native-community/checkbox'
import PrimaryButton from '../atoms/PrimaryButton'
import SecondaryButton from '../atoms/SecondaryButton'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { ReactNode, useEffect } from 'react'

interface StatsFilterModalProps {
    title: string
    data: { display: string | ReactNode; value: string }[]
    visible: boolean
    onClose: (filters: string[]) => void
}

const StatsFilterModal: React.FC<StatsFilterModalProps> = ({
    title,
    data,
    visible,
    onClose,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const [boxData, setBoxData] = React.useState(
        data.map(item => ({ ...item, checked: false })),
    )

    useEffect(() => {
        setBoxData(data.map(item => ({ ...item, checked: false })))
    }, [data])

    const onCheckboxChange = (value: string) => {
        setBoxData(curr => {
            return curr.map(item => {
                if (item.value === value) {
                    return { ...item, checked: !item.checked }
                }
                return item
            })
        })
    }

    const onResetFilters = async () => {
        setBoxData(curr => {
            return curr.map(item => {
                return { ...item, checked: false }
            })
        })
    }

    const styles = StyleSheet.create({
        title: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            marginBottom: 10,
        },
        itemContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        item: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
        },
    })

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
                data={boxData}
                renderItem={({ item: { display, value, checked } }) => {
                    return (
                        <View style={styles.itemContainer}>
                            <CheckBox
                                value={checked}
                                onChange={() => {
                                    onCheckboxChange(value)
                                }}
                                tintColors={{
                                    true: colors.textPrimary,
                                    false: colors.gray,
                                }}
                                onFillColor={colors.textPrimary}
                                onCheckColor={colors.textPrimary}
                            />
                            <Text
                                style={styles.item}
                                onPress={() => {
                                    onCheckboxChange(value)
                                }}>
                                {display}
                            </Text>
                        </View>
                    )
                }}
            />
            <SecondaryButton text="clear all" onPress={onResetFilters} />
            <PrimaryButton
                text="done"
                loading={false}
                onPress={() => {
                    onClose(
                        boxData
                            .filter(box => box.checked)
                            .map(box => box.value),
                    )
                }}
            />
        </BaseModal>
    )
}

export default StatsFilterModal
