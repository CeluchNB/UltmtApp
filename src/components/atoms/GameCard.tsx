import { Game } from '../../types/game'
import { IconButton } from 'react-native-paper'
import { useColors } from '../../hooks'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

export interface GameCardProps {
    game: Game
    onPress: (id: string) => void
}

const GameCard: React.FC<GameCardProps> = props => {
    const { colors } = useColors()
    const liveOpacity = React.useRef(new Animated.Value(0)).current

    const { game, onPress } = props
    const {
        _id,
        teamOne,
        teamTwo,
        teamOneScore,
        teamTwoScore,
        scoreLimit,
        teamOneActive,
    } = game

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
            shadowColor: colors.textPrimary,
        },
        teamContainer: {
            display: 'flex',
            flexDirection: 'row',
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            color: colors.textPrimary,
        },
        teamNameContainer: {
            flex: 1,
        },
        teamNameText: {
            color: colors.textPrimary,
        },
        teamText: {
            color: colors.textSecondary,
            fontWeight: 'bold',
            fontSize: 20,
        },
        scoreLimit: {
            alignSelf: 'center',
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        footer: {
            display: 'flex',
            flexDirection: 'row',
            alignSelf: 'flex-end',
        },
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginTop: 5,
            marginRight: 5,
            backgroundColor: 'red',
            alignSelf: 'flex-end',
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
                {teamOneActive && (
                    <Animated.View
                        style={[styles.circle, { opacity: liveOpacity }]}
                    />
                )}
                <View style={styles.teamContainer}>
                    <View style={styles.teamNameContainer}>
                        <Text style={styles.teamText}>{teamOne.name}</Text>
                        {teamOne.teamname && (
                            <Text style={styles.teamNameText}>
                                @{teamOne.teamname}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.teamText}>{teamOneScore}</Text>
                </View>
                <View style={styles.teamContainer}>
                    <View style={styles.teamNameContainer}>
                        <Text style={styles.teamText}>{teamTwo.name}</Text>
                        {teamTwo.teamname && (
                            <Text style={styles.teamNameText}>
                                @{teamTwo.teamname}
                            </Text>
                        )}
                    </View>

                    <Text style={styles.teamText}>{teamTwoScore}</Text>
                </View>
                <View style={styles.footer}>
                    {teamOneActive && (
                        <Text style={styles.scoreLimit}>
                            Game to {scoreLimit}
                        </Text>
                    )}
                    <IconButton
                        color={colors.textPrimary}
                        icon="chevron-right"
                        testID="go-button"
                    />
                </View>
            </Pressable>
        </View>
    )
}

export default GameCard
