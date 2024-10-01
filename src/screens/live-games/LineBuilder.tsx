import BaseScreen from '../../components/atoms/BaseScreen'
import { Chip } from 'react-native-paper'
import { DisplayUser } from '../../types/user'
import { GameSchema } from '../../models'
import { LineBuilderProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { useObject } from '../../context/realm'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'

interface Line {
    name: string
    players: DisplayUser[]
}

export const LineBuilder: React.FC<LineBuilderProps> = ({
    route,
    navigation,
}) => {
    const { gameId, teamId } = route.params

    const {
        theme: { colors, size },
    } = useTheme()
    const [lines, setLines] = useState<Line[]>([
        { name: 'Offense', players: [] },
    ])
    const [activeLine, setActiveLine] = useState<number | undefined>(undefined)

    const game = useObject<GameSchema>('Game', gameId)
    const players =
        game?.teamOne._id === teamId
            ? game.teamOnePlayers
            : game?.teamTwoPlayers

    const styles = StyleSheet.create({
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <Text
                style={{
                    color: colors.textPrimary,
                    fontSize: size.fontThirty,
                }}>
                Build Lines
            </Text>
            <FlatList
                horizontal={true}
                data={lines.concat({ name: 'Add Line +', players: [] })}
                renderItem={({ item, index }) => {
                    return (
                        <Chip
                            style={{
                                backgroundColor: colors.primary,
                                margin: 5,
                            }}
                            mode="outlined"
                            onPress={() => {
                                setActiveLine(index)
                            }}
                            selectedColor={colors.gray}>
                            {item.name}
                        </Chip>
                    )
                }}
            />
            <FlatList
                data={activeLine !== undefined ? players : lines[0].players}
                renderItem={({ item }) => {
                    return (
                        <Chip
                            style={styles.chip}
                            mode="outlined"
                            onPress={() => {
                                // toggleSelection(item)
                            }}
                            selectedColor={colors.gray}
                            ellipsizeMode="tail">
                            {item.firstName} {item.lastName}
                        </Chip>
                    )
                }}
            />
            {activeLine === undefined ? (
                <>
                    <PrimaryButton
                        text="save"
                        onPress={() => {
                            setActiveLine(undefined)
                        }}
                        loading={false}
                    />
                    <SecondaryButton
                        text="cancel"
                        onPress={async () => {
                            setActiveLine(undefined)
                        }}
                    />
                </>
            ) : (
                <PrimaryButton
                    text="done"
                    onPress={() => navigation.goBack()}
                    loading={false}
                />
            )}
        </BaseScreen>
    )
}

export default LineBuilder
