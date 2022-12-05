import ActionDisplayItem from '../atoms/ActionDisplayItem'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import React from 'react'
import { SavedServerAction } from '../../types/action'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface PointAccordionProps {
    point: Point
    actions: SavedServerAction[]
    teamOne: GuestTeam
    teamTwo: GuestTeam
}

const PointAccordion: React.FC<PointAccordionProps> = ({
    point,
    actions,
    teamOne,
    teamTwo,
}) => {
    const { colors } = useColors()
    const [expanded, setExpanded] = React.useState(false)

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
        titleText: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
            fontWeight: weight.bold,
        },
    })

    return (
        <View style={{ backgroundColor: colors.primary }}>
            <List.Accordion
                style={styles.accordion}
                expanded={expanded}
                onPress={() => {
                    setExpanded(curr => !curr)
                }}
                right={props => (
                    <List.Icon
                        {...props}
                        color={colors.textPrimary}
                        icon={props.isExpanded ? 'chevron-up' : 'chevron-down'}
                    />
                )}
                titleStyle={{ color: colors.textPrimary }}
                title={
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <View style={{ marginRight: 10 }}>
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
                {actions.map(action => {
                    return (
                        <View key={action.actionNumber} style={styles.item}>
                            <ActionDisplayItem action={action} />
                        </View>
                    )
                })}
            </List.Accordion>
        </View>
    )
}

export default PointAccordion
