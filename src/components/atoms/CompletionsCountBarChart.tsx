import { BarChart } from 'react-native-gifted-charts'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'

interface CompletionsCountBarChartProps {
    data: { value: number }[]
    style?: ViewStyle
}

const CompletionsCountBarChart: React.FC<CompletionsCountBarChartProps> = ({
    data,
    style,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        xLabel: {
            color: colors.textPrimary,
            alignSelf: 'center',
        },
        yLabel: {
            color: colors.textPrimary,
            transform: [
                { rotate: '-90deg' },
                { translateX: -75 },
                { translateY: -40 },
            ],
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
        },
        yLabelContainer: {
            flex: 1,
        },
        chartcontainer: {
            flex: 19,
        },
        yLabelChartContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
    })

    return (
        <View style={style} testID="completions-count-bar-chart">
            <View style={styles.yLabelChartContainer}>
                <View style={styles.yLabelContainer}>
                    <Text style={styles.yLabel}>Possessions</Text>
                </View>
                <View style={styles.chartcontainer}>
                    <BarChart
                        data={data}
                        dashGap={10}
                        xAxisColor={colors.darkGray}
                        yAxisColor={colors.darkGray}
                        frontColor={colors.textPrimary}
                        xAxisLabelTexts={[
                            '0 - 5',
                            '6 - 10',
                            '11 - 15',
                            '16 - 20',
                            '21 - 25',
                            '25+',
                        ]}
                        xAxisLabelTextStyle={{ color: colors.textSecondary }}
                        yAxisTextStyle={{ color: colors.textSecondary }}
                        spacing={24}
                    />
                </View>
            </View>
            <Text style={styles.xLabel}>Completions</Text>
        </View>
    )
}

export default CompletionsCountBarChart
