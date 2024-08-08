import ActionDisplayMediator from './ActionDisplayMediator'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import { isLivePoint } from '../../utils/point'
import { useTheme } from '../../hooks'
import { Action, ServerActionData } from '../../types/action'
import {
    ActivityIndicator,
    Animated,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import React, { useEffect } from 'react'

const AccordionRightView = (props: { point: Point; isExpanded: boolean }) => {
    const {
        theme: { colors },
    } = useTheme()
    const liveOpacity = React.useRef(new Animated.Value(0)).current
    const isLive = React.useMemo(() => {
        return isLivePoint(props.point)
    }, [props.point])

    useEffect(() => {
        if (isLive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(liveOpacity, {
                        toValue: 1,
                        duration: 750,
                        useNativeDriver: true,
                    }),
                    Animated.timing(liveOpacity, {
                        toValue: 0,
                        duration: 750,
                        useNativeDriver: true,
                    }),
                ]),
            ).start()
        }
    }, [isLive, liveOpacity])

    const styles = StyleSheet.create({
        circleContainer: {
            marginTop: -10,
        },
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'red',
            alignSelf: 'flex-end',
        },
    })
    return (
        <View>
            {isLive && (
                <View style={styles.circleContainer}>
                    <Animated.View
                        style={[styles.circle, { opacity: liveOpacity }]}
                    />
                </View>
            )}
            <List.Icon
                {...props}
                color={colors.textPrimary}
                icon={props.isExpanded ? 'chevron-up' : 'chevron-down'}
            />
        </View>
    )
}

const getAccordionRightView = (point: Point) => {
    return (props: { isExpanded: boolean }) => {
        return (
            <AccordionRightView point={point} isExpanded={props.isExpanded} />
        )
    }
}

interface PointAccordionProps {
    point: Point
    actions: (Action | { ad: boolean })[]
    expanded: boolean
    loading: boolean
    teamOne: GuestTeam
    teamTwo: GuestTeam
    error: string
    onActionPress: (action: ServerActionData) => void
}

const PointAccordion: React.FC<PointAccordionProps> = ({
    point,
    actions,
    expanded,
    loading,
    teamOne,
    teamTwo,
    error,
    onActionPress,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        accordion: {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            borderColor: expanded ? colors.textSecondary : colors.textPrimary,
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 4,
            margin: 4,
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
            marginRight: 5,
            overflow: 'hidden',
        },
        error: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginTop: 5,
            marginRight: 5,
        },
        holdCircle: {
            backgroundColor: colors.success,
        },
        breakCircle: {
            backgroundColor: '#3183ff',
        },
        notScoringCircle: {
            backgroundColor: colors.primary,
        },
    })

    const circleColor = (team: GuestTeam) => {
        if (isLivePoint(point)) return styles.notScoringCircle

        // team is team one
        // team one pulls and scores - blue
        // team one receives and scores - green
        // team is team two
        // team one pulls and doesn't score - green
        // team one receives and doesn't score - blue
        if (team._id === teamOne._id) {
            if (
                point.pullingTeam._id === teamOne._id &&
                point.scoringTeam?._id === teamOne._id
            ) {
                return styles.breakCircle
            } else if (
                point.pullingTeam._id !== teamOne._id &&
                point.scoringTeam?._id === teamOne._id
            ) {
                return styles.holdCircle
            }
        } else {
            if (
                point.pullingTeam._id === teamOne._id &&
                point.scoringTeam?._id !== teamOne._id
            ) {
                return styles.holdCircle
            } else if (
                point.pullingTeam._id !== teamOne._id &&
                point.scoringTeam?._id !== teamOne._id
            ) {
                return styles.breakCircle
            }
        }

        return styles.notScoringCircle
    }

    return (
        <View style={{ backgroundColor: colors.primary }}>
            <List.Accordion
                id={point._id}
                theme={{ colors: { background: colors.primary } }}
                style={styles.accordion}
                right={getAccordionRightView(point)}
                titleStyle={{ color: colors.textPrimary }}
                title={
                    <View style={styles.titleContainer}>
                        <View style={styles.teamContainer}>
                            <View style={styles.titleContainer}>
                                <Text
                                    style={styles.titleText}
                                    numberOfLines={1}>
                                    {teamOne.name} (
                                    {point.pullingTeam._id === teamOne._id
                                        ? 'pull'
                                        : 'receive'}
                                    )
                                </Text>
                                <View
                                    style={[
                                        styles.circle,
                                        circleColor(teamOne),
                                    ]}
                                />
                            </View>
                            <View style={styles.titleContainer}>
                                <Text
                                    style={styles.titleText}
                                    numberOfLines={1}>
                                    {teamTwo.name} (
                                    {point.pullingTeam._id === teamOne._id
                                        ? 'receive'
                                        : 'pull'}
                                    )
                                </Text>
                                <View
                                    style={[
                                        styles.circle,
                                        circleColor(teamTwo),
                                    ]}
                                />
                            </View>
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
                {error?.length > 0 && <Text style={styles.error}>{error}</Text>}
                {!loading && (
                    <FlatList
                        data={actions}
                        renderItem={({ item, index }) => {
                            return (
                                <View key={index} style={styles.item}>
                                    <ActionDisplayMediator
                                        action={item}
                                        onPress={onActionPress}
                                        teamOne={teamOne}
                                        teamTwo={teamTwo}
                                    />
                                </View>
                            )
                        }}
                    />
                )}
            </List.Accordion>
        </View>
    )
}

export default PointAccordion
