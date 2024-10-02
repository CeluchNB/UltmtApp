import BaseModal from '../../components/atoms/BaseModal'
import BaseScreen from '../../components/atoms/BaseScreen'
import { Chip } from 'react-native-paper'
import { GameSchema } from '../../models'
import { InGameStatsUser } from '../../types/user'
import { LineBuilderProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import UserInput from '../../components/atoms/UserInput'
import { useObject } from '../../context/realm'
import { useSelectPlayers } from '../../hooks/game-edit-actions/use-select-players'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'

interface Line {
    name: string
    players: InGameStatsUser[]
}

export const LineBuilder: React.FC<LineBuilderProps> = ({
    route,
    navigation,
}) => {
    const { gameId, teamId } = route.params

    const {
        theme: { colors, size },
    } = useTheme()

    const [lines, setLines] = useState<Line[]>([])
    const [activeLine, setActiveLine] = useState<number | undefined>(undefined)
    const [modalVisible, setModalVisible] = useState(false)
    const [lineName, setLineName] = useState('')
    const [initialSelectedPlayers, setInitialSelectedPlayers] = useState<
        InGameStatsUser[]
    >([])
    const { selectedPlayers, toggleSelection, clearSelection } =
        useSelectPlayers(initialSelectedPlayers)

    const isPlayerSelected = (playerId: string) => {
        if (activeLine === undefined) return false

        return selectedPlayers.find(p => p._id === playerId)
    }

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
                                if (index === lines.length) {
                                    setModalVisible(true)
                                } else {
                                    clearSelection()
                                    setActiveLine(index)
                                    // console.log('setting players', item.players)
                                    setInitialSelectedPlayers(item.players)
                                    for (const player of item.players) {
                                        toggleSelection(player)
                                    }
                                }
                            }}
                            selectedColor={
                                activeLine === index
                                    ? colors.textPrimary
                                    : colors.gray
                            }>
                            {item.name}
                            {index < lines.length
                                ? ` (${item.players.length})`
                                : null}
                        </Chip>
                    )
                }}
            />
            <FlatList
                data={players}
                renderItem={({ item }) => {
                    return (
                        <Chip
                            style={styles.chip}
                            mode="outlined"
                            onPress={() => {
                                toggleSelection(item)
                            }}
                            selectedColor={
                                isPlayerSelected(item._id)
                                    ? colors.textPrimary
                                    : colors.gray
                            }
                            ellipsizeMode="tail">
                            {item.firstName} {item.lastName}
                        </Chip>
                    )
                }}
            />
            {activeLine === undefined ? (
                <PrimaryButton
                    text="done"
                    onPress={() => navigation.goBack()}
                    loading={false}
                />
            ) : (
                <>
                    <PrimaryButton
                        text="save"
                        onPress={() => {
                            setActiveLine(undefined)
                            setLines(curr => {
                                curr[activeLine].players = selectedPlayers
                                return curr
                            })
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
            )}
            <BaseModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false)
                }}>
                <Text
                    style={{
                        color: colors.textPrimary,
                        fontSize: size.fontTwenty,
                    }}>
                    Name your line
                </Text>
                <UserInput
                    placeholder="Line name"
                    onChangeText={text => {
                        setLineName(text)
                    }}
                />
                <PrimaryButton
                    text="done"
                    onPress={() => {
                        setLines(curr =>
                            curr.concat({ name: lineName, players: [] }),
                        )
                        setActiveLine(lines.length)
                        setLineName('')
                        setModalVisible(false)
                        setInitialSelectedPlayers([])
                        clearSelection()
                    }}
                    loading={false}
                />
            </BaseModal>
        </BaseScreen>
    )
}

export default LineBuilder
