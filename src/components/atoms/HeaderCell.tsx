import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React from 'react'
import { mapStatDisplayName } from '../../utils/stats'
import { useTheme } from '../../hooks'

import { StyleSheet, Text, TouchableOpacity } from 'react-native'

interface HeaderCellProps {
    value: string
    sortColumn: string
    sortDirection: 'asc' | 'desc'
    onPress: () => void
}
const HeaderCell: React.FC<HeaderCellProps> = ({
    value,
    sortColumn,
    sortDirection,
    onPress,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const displaySortArrow = (
        column: string,
        direction: 'asc' | 'desc',
    ): { display: 'none' | 'flex' } => {
        return {
            display:
                column === sortColumn && sortDirection === direction
                    ? 'flex'
                    : 'none',
        }
    }

    const styles = StyleSheet.create({
        titleCell: {
            margin: 10,
            height: 55,
            borderBottomColor: colors.textPrimary,
            borderBottomWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            color: colors.textPrimary,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
    })

    return (
        <TouchableOpacity style={styles.titleCell} onPress={onPress}>
            <Icon
                name="chevron-up"
                color={colors.textPrimary}
                style={displaySortArrow(value, 'asc')}
            />
            <Text numberOfLines={2} style={styles.title}>
                {mapStatDisplayName(value)}
            </Text>
            <Icon
                name="chevron-down"
                color={colors.textPrimary}
                style={displaySortArrow(value, 'desc')}
            />
        </TouchableOpacity>
    )
}

export default HeaderCell
