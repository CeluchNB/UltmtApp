import CompletionsCountBarChart from '../atoms/CompletionsCountBarChart'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface CompletionsChartsProps {
    completionsToScores: { value: number }[]
    completionsToTurnovers: { value: number }[]
}

const CompletionsCharts: React.FC<CompletionsChartsProps> = props => {
    const { completionsToScores, completionsToTurnovers } = props

    const {
        theme: { size, colors },
    } = useTheme()

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textSecondary,
        },
        chartStyle: {
            marginTop: 5,
        },
    })
    return (
        <View>
            {completionsToScores.length > 0 && (
                <View>
                    <Text
                        style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        Completions to Score
                    </Text>
                    <CompletionsCountBarChart
                        style={styles.chartStyle}
                        data={completionsToScores}
                    />
                </View>
            )}
            {completionsToTurnovers.length > 0 && (
                <View>
                    <Text
                        style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        Completions to Turnover
                    </Text>
                    <CompletionsCountBarChart
                        style={styles.chartStyle}
                        data={completionsToTurnovers}
                    />
                </View>
            )}
        </View>
    )
}

export default CompletionsCharts
