import { Connection } from '../../types/stats'
import React from 'react'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

const SCORE_COLOR = '#2196f3'
const CATCH_COLOR = '#1de9b6'
const DROP_COLOR = '#f50057'
const MAX_CIRCLE_WIDTH = 180

const MAX_RATIO = 0.75
const MIN_RATIO = 0.35

interface ConnectionsStatViewProps {
    loading: boolean
    connection?: Connection
    playerOne?: string
    playerTwo?: string
}

const calculateRatio = (value: number, connection: Connection): number => {
    const { scores, catches, drops } = connection
    const ratio = value / (scores + catches + drops)
    return Math.min(MIN_RATIO + ratio / 2, MAX_RATIO)
}

const ConnectionsStatView: React.FC<ConnectionsStatViewProps> = ({
    loading,
    connection,
    playerOne,
    playerTwo,
}) => {
    const {
        theme: { weight, size, colors },
    } = useTheme()

    const widths = React.useMemo(() => {
        if (!connection) return { scores: 0, catches: 0, drops: 0 }

        const { scores, catches, drops } = connection
        const scoresRatio = calculateRatio(scores, connection)
        const catchesRatio = calculateRatio(catches, connection)
        const dropsRatio = calculateRatio(drops, connection)

        return {
            scores: scoresRatio * MAX_CIRCLE_WIDTH,
            catches: catchesRatio * MAX_CIRCLE_WIDTH,
            drops: dropsRatio * MAX_CIRCLE_WIDTH,
        }
    }, [connection])

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        scores: {
            width: widths.scores,
            height: widths.scores,
            borderRadius: widths.scores / 2,
            backgroundColor: SCORE_COLOR,
        },
        catches: {
            width: widths.catches,
            height: widths.catches,
            borderRadius: widths.catches / 2,
            backgroundColor: CATCH_COLOR,
        },
        drops: {
            width: widths.drops,
            height: widths.drops,
            borderRadius: widths.drops / 2,
            backgroundColor: DROP_COLOR,
        },
        circle: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        text: {
            fontWeight: weight.bold,
            fontSize: size.fontFifteen,
            color: colors.primary,
        },
        errorText: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            textAlign: 'center',
        },
    })

    if (loading) {
        return (
            <ActivityIndicator
                size="small"
                color={colors.textPrimary}
                testID="connections-activity-indicator"
            />
        )
    }

    if (!connection) {
        return (
            <Text style={styles.errorText}>
                No connections from {playerOne ? playerOne : 'Player One'} to{' '}
                {playerTwo ? playerTwo : 'Player Two'}
            </Text>
        )
    }

    return (
        <View style={styles.container}>
            <View style={[styles.scores, styles.circle]}>
                <Text style={styles.text}>{connection.scores}</Text>
                <Text style={styles.text}>Scores</Text>
            </View>
            <View style={[styles.catches, styles.circle]}>
                <Text style={styles.text}>{connection.catches}</Text>
                <Text style={styles.text}>Catches</Text>
            </View>
            <View style={[styles.drops, styles.circle]}>
                <Text style={styles.text}>{connection.drops}</Text>
                <Text style={styles.text}>Drops</Text>
            </View>
        </View>
    )
}

export default ConnectionsStatView
