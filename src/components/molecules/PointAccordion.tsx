import ActionDisplayItem from '../atoms/ActionDisplayItem'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import React from 'react'
import { SavedServerAction } from '../../types/action'
import { useColors } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface PointAccordionProps {
    point: Point
    actions: SavedServerAction[]
    expanded: boolean
    loading: boolean
    teamOne: GuestTeam
    teamTwo: GuestTeam
}

const PointAccordion: React.FC<PointAccordionProps> = ({
    point,
    actions,
    expanded,
    loading,
    teamOne,
    teamTwo,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        accordion: {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            borderColor: expanded ? colors.textSecondary : colors.textPrimary,
            borderStyle: 'solid',
            borderWidth: 1,
            padding: 0,
        },
        item: {
            marginBottom: 5,
            width: '90%',
            alignSelf: 'center',
        },
        titleContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        teamContainer: {
            marginRight: 10,
        },
        titleText: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
            fontWeight: weight.bold,
        },
    })

    return (
        <View style={{ backgroundColor: colors.primary }}>
            <List.Accordion
                id={point._id}
                style={styles.accordion}
                right={props => (
                    <List.Icon
                        {...props}
                        color={colors.textPrimary}
                        icon={props.isExpanded ? 'chevron-up' : 'chevron-down'}
                    />
                )}
                titleStyle={{ color: colors.textPrimary }}
                title={
                    <View style={styles.titleContainer}>
                        <View style={styles.teamContainer}>
                            <Text style={styles.titleText}>{teamOne.name}</Text>
                            <Text style={styles.titleText}>{teamTwo.name}</Text>
                        </View>
                        <View>
                            <Text style={styles.titleText}>
                                {point.teamOneScore}
                            </Text>
                            <Text style={styles.titleText}>
                                {point.teamTwoScore}
                            </Text>
                        </View>
                    </View>
                }>
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color={colors.textPrimary}
                    />
                )}
                {!loading &&
                    actions
                        .sort((a, b) => b.actionNumber - a.actionNumber)
                        .map(action => {
                            return (
                                <View
                                    key={action.actionNumber}
                                    style={styles.item}>
                                    <ActionDisplayItem action={action} />
                                </View>
                            )
                        })}
            </List.Accordion>
        </View>
    )
}

export default PointAccordion
