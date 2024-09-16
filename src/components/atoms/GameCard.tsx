import { Game } from '../../types/game'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { IconButton } from 'react-native-paper'
import { gameIsActive } from '../../utils/game'
import { useTheme } from '../../hooks'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

export interface GameCardProps {
    game: Game
    onPress: (id: string) => void
}

const GameCard: React.FC<GameCardProps> = props => {
    const {
        theme: { colors },
    } = useTheme()
    const liveOpacity = React.useRef(new Animated.Value(0)).current

    const { game, onPress } = props
    const {
        _id,
        teamOne,
        teamTwo,
        teamOneScore,
        teamTwoScore,
        scoreLimit,
        totalViews,
    } = game

    const activeGame = gameIsActive(game)

    useEffect(() => {
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
    }, [liveOpacity])

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.primary,
            marginTop: 10,
            marginRight: 5,
            marginLeft: 5,
            color: colors.textPrimary,
            borderColor: colors.textPrimary,
            borderWidth: 1,
            borderRadius: 8,
            elevation: 10,
        },
        teamContainer: {
            display: 'flex',
            flexDirection: 'row',
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            color: colors.textPrimary,
        },
        winnerIndicatorContainer: {
            marginLeft: 10,
            flex: 1,
            marginTop: 4,
        },
        teamNameText: {
            color: colors.textPrimary,
        },
        teamText: {
            color: colors.textSecondary,
            fontWeight: 'bold',
            fontSize: 20,
        },
        footer: {
            display: 'flex',
            flexDirection: 'row',
        },
        footerText: {
            alignSelf: 'center',
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        scoreLimitContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignSelf: 'flex-end',
        },
        viewsContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        viewsMargin: {
            margin: 5,
        },
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginTop: 5,
            marginRight: 5,
        },
        liveCircle: {
            backgroundColor: 'red',
            alignSelf: 'flex-end',
        },
        winnerCircle: {
            backgroundColor: !activeGame ? colors.textPrimary : colors.primary,
        },
        loserCircle: {
            display: 'none',
        },
    })

    return (
        <View style={styles.container}>
            <Pressable
                android_ripple={{ color: colors.textPrimary }}
                onPress={() => {
                    onPress(_id)
                }}
                testID="game-card-pressable">
                {activeGame && (
                    <Animated.View
                        style={[
                            styles.circle,
                            styles.liveCircle,
                            { opacity: liveOpacity },
                        ]}
                    />
                )}
                <View style={styles.teamContainer}>
                    <View>
                        <Text style={styles.teamText}>{teamOne?.name}</Text>
                        {teamOne?.teamname && (
                            <Text style={styles.teamNameText}>
                                @{teamOne?.teamname}
                            </Text>
                        )}
                    </View>
                    <View style={styles.winnerIndicatorContainer}>
                        <View
                            style={[
                                styles.circle,
                                game.teamOneScore > game.teamTwoScore
                                    ? styles.winnerCircle
                                    : styles.loserCircle,
                            ]}
                        />
                    </View>
                    <Text style={styles.teamText}>{teamOneScore}</Text>
                </View>
                <View style={styles.teamContainer}>
                    <View>
                        <Text style={styles.teamText}>{teamTwo?.name}</Text>
                        {teamTwo?.teamname && (
                            <Text style={styles.teamNameText}>
                                @{teamTwo?.teamname}
                            </Text>
                        )}
                    </View>
                    <View style={styles.winnerIndicatorContainer}>
                        <View
                            style={[
                                styles.circle,
                                game.teamTwoScore > game.teamOneScore
                                    ? styles.winnerCircle
                                    : styles.loserCircle,
                            ]}
                        />
                    </View>
                    <Text style={styles.teamText}>{teamTwoScore}</Text>
                </View>
                <View style={styles.footer}>
                    <View style={styles.viewsContainer}>
                        {totalViews > 0 && (
                            <View
                                style={[
                                    styles.viewsContainer,
                                    styles.viewsMargin,
                                ]}>
                                <Text style={styles.footerText}>
                                    {totalViews}
                                </Text>
                                <Icon
                                    style={styles.viewsMargin}
                                    size={20}
                                    name="eye-outline"
                                    color={colors.textPrimary}
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.scoreLimitContainer}>
                        {gameIsActive(game) && (
                            <Text style={styles.footerText}>
                                Game to {scoreLimit}
                            </Text>
                        )}
                        <IconButton
                            iconColor={colors.textPrimary}
                            icon="chevron-right"
                            testID="go-button"
                        />
                    </View>
                </View>
            </Pressable>
        </View>
    )
}

export default GameCard
