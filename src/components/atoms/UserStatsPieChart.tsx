import { PieChart } from 'react-native-gifted-charts'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface UserStatsPieChartProps {
    goals?: number
    assists?: number
    blocks?: number
    throwaways?: number
}

const GOAL_COLOR = '#2196f3'
const ASSIST_COLOR = '#ffc107'
const BLOCK_COLOR = '#1de9b6'
const THROWAWAY_COLOR = '#f50057'

const pluralize = (text: string, amount?: number): string => {
    if (amount === 1) {
        return text
    }
    return `${text}s`
}

const CenterLabelComponent: React.FC<UserStatsPieChartProps> = props => {
    const {
        theme: { weight, size },
    } = useTheme()

    const style = StyleSheet.create({
        text: { fontWeight: weight.bold, fontSize: size.fontFifteen },
    })

    const display = React.useMemo(() => {
        const { goals, assists, blocks, throwaways } = props
        const array = [
            {
                value: goals,
                display: (
                    <Text
                        style={[{ color: GOAL_COLOR }, style.text]}
                        key="goals">
                        {goals} {pluralize('Goal', goals)}
                    </Text>
                ),
            },
            {
                value: assists,
                display: (
                    <Text
                        style={[{ color: ASSIST_COLOR }, style.text]}
                        key="assists">
                        {assists} {pluralize('Assist', assists)}
                    </Text>
                ),
            },
            {
                value: blocks,
                display: (
                    <Text
                        style={[{ color: BLOCK_COLOR }, style.text]}
                        key="blocks">
                        {blocks} {pluralize('Block', blocks)}
                    </Text>
                ),
            },
            {
                value: throwaways,
                display: (
                    <Text
                        style={[{ color: THROWAWAY_COLOR }, style.text]}
                        key="throwaways">
                        {throwaways} {pluralize('Throwaway', throwaways)}
                    </Text>
                ),
            },
        ]
        return array
            .filter(item => !!item.value)
            .sort((a, b) => b.value! - a.value!)
    }, [props, style])

    return <View>{display.map(item => item.display)}</View>
}

const UserStatsPieChart: React.FC<UserStatsPieChartProps> = props => {
    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            alignSelf: 'center',
            margin: 10,
        },
    })

    const data = React.useMemo(() => {
        const { goals, assists, blocks, throwaways } = props
        const array = []
        if (goals) {
            array.push({
                value: goals,
                color: GOAL_COLOR,
            })
        }
        if (assists) {
            array.push({
                value: assists,
                color: ASSIST_COLOR,
            })
        }
        if (blocks) {
            array.push({
                value: blocks,
                color: BLOCK_COLOR,
            })
        }
        if (throwaways) {
            array.push({
                value: throwaways,
                color: THROWAWAY_COLOR,
            })
        }
        array.sort((a, b) => b.value - a.value)

        return array
    }, [props])

    if (data.length === 0) return null

    const renderCenterLabelComponent = () => {
        return <CenterLabelComponent {...props} />
    }

    return (
        <View style={styles.container}>
            <PieChart
                radius={120}
                innerRadius={100}
                data={data}
                donut={true}
                showText={true}
                innerCircleColor={colors.primary}
                centerLabelComponent={renderCenterLabelComponent}
                labelsPosition="onBorder"
                fontWeight="bold"
            />
        </View>
    )
}

export default UserStatsPieChart
