import BaseModal from '../../components/atoms/BaseModal'
import { GameSchema } from '../../models'
import { InGameStatsUser } from '../../types/user'
import { LineBuilderProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import UserInput from '../../components/atoms/UserInput'
import { useObject } from '../../context/realm'
import { useSelectPlayers } from '../../hooks/game-edit-actions/use-select-players'
import { useTheme } from '../../hooks'
import { Button, Chip } from 'react-native-paper'
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { SetStateAction, useState } from 'react'

interface Line {
    name: string
    players: InGameStatsUser[]
}

interface CreateLineModalProps {
    lines: Line[]
    setLines: React.Dispatch<SetStateAction<Line[]>>
    setActiveLine: (value: number) => void
    setModalVisible: (value: boolean) => void
}
const CreateLineModal: React.FC<CreateLineModalProps> = props => {
    const {
        theme: { colors, size },
    } = useTheme()
    const [lineName, setLineName] = useState('')

    const { lines, setLines, setActiveLine, setModalVisible } = props

    return (
        <>
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
                    if (lineName.length === 0) return

                    setLines(curr =>
                        curr.concat({ name: lineName, players: [] }),
                    )
                    setActiveLine(lines.length)
                    setLineName('')
                    setModalVisible(false)
                }}
                loading={false}
            />
        </>
    )
}

interface ViewLineListProps {
    players: InGameStatsUser[]
}

const ViewLineList: React.FC<ViewLineListProps> = ({ players }) => {
    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
    })

    return (
        <FlatList
            data={players}
            renderItem={({ item }) => {
                return (
                    <Chip
                        style={styles.chip}
                        mode="outlined"
                        selectedColor={colors.textPrimary}
                        ellipsizeMode="tail">
                        {item.firstName} {item.lastName}
                    </Chip>
                )
            }}
        />
    )
}

interface EditLineListParams {
    selectedPlayers: InGameStatsUser[]
    players: InGameStatsUser[]
    toggleSelection: (player: InGameStatsUser) => void
}

const EditLineList: React.FC<EditLineListParams> = ({
    selectedPlayers,
    toggleSelection,
    players,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const isPlayerSelected = (playerId: string) => {
        return selectedPlayers.find(p => p._id === playerId)
    }

    const styles = StyleSheet.create({
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
    })

    return (
        <FlatList
            data={players}
            renderItem={({ item }) => {
                return (
                    <Chip
                        style={styles.chip}
                        selectedColor={
                            isPlayerSelected(item._id)
                                ? colors.textPrimary
                                : colors.gray
                        }
                        onPress={() => toggleSelection(item)}>
                        {item.firstName} {item.lastName}
                    </Chip>
                )
            }}
        />
    )
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

    const [initialSelectedPlayers, setInitialSelectedPlayers] = useState<
        InGameStatsUser[]
    >([])
    const { selectedPlayers, toggleSelection, clearSelection } =
        useSelectPlayers(initialSelectedPlayers)
    const [mode, setMode] = useState<'edit' | 'view'>('view')

    const game = useObject<GameSchema>('Game', gameId)
    const players =
        game?.teamOne._id === teamId
            ? game.teamOnePlayers
            : game?.teamTwoPlayers

    const onSelectLine = (item: Line, index: number) => {
        clearSelection()
        setActiveLine(index)
        setInitialSelectedPlayers(item.players)
        for (const player of item.players) {
            toggleSelection(player)
        }
    }

    const styles = StyleSheet.create({
        screen: {
            width: '95%',
            height: '100%',
            flexDirection: 'column',
            flex: 1,
            alignSelf: 'center',
        },
        noLineWarning: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            marginTop: 100,
        },
        pageContainer: { display: 'flex', flex: 1 },
        contentContainer: { flex: 1 },
        listContainer: {
            flexDirection: 'row',
        },
        button: {
            marginBottom: 10,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <Text
                style={{
                    color: colors.textPrimary,
                    fontSize: size.fontThirty,
                }}>
                Build Lines
            </Text>
            <View style={styles.pageContainer}>
                <View style={styles.contentContainer}>
                    {lines.length === 0 ? (
                        <Text style={styles.noLineWarning}>
                            No lines created yet
                        </Text>
                    ) : (
                        <View style={styles.listContainer}>
                            <FlatList
                                data={lines}
                                renderItem={({ item, index }) => {
                                    return (
                                        <Button
                                            mode="text"
                                            textColor={
                                                activeLine === index
                                                    ? colors.textPrimary
                                                    : colors.gray
                                            }
                                            rippleColor={`${colors.textPrimary}44`}
                                            onPress={() =>
                                                onSelectLine(item, index)
                                            }>
                                            {item.name} ({item.players.length})
                                        </Button>
                                    )
                                }}
                            />
                            {mode === 'view' ? (
                                <ViewLineList
                                    players={lines[activeLine ?? 0].players}
                                />
                            ) : (
                                <EditLineList
                                    players={players ?? []}
                                    selectedPlayers={selectedPlayers}
                                    toggleSelection={toggleSelection}
                                />
                            )}
                        </View>
                    )}
                </View>
                {activeLine === undefined ? (
                    <>
                        <SecondaryButton
                            style={styles.button}
                            text="add line"
                            onPress={async () => {
                                setModalVisible(true)
                            }}
                        />
                        <PrimaryButton
                            text="done"
                            onPress={() => navigation.goBack()}
                            loading={false}
                        />
                    </>
                ) : (
                    <>
                        <PrimaryButton
                            style={{ backgroundColor: colors.success }}
                            text="edit"
                            onPress={() => {
                                setMode('edit')
                            }}
                            loading={false}
                        />
                        <PrimaryButton
                            style={{ backgroundColor: colors.error }}
                            text="delete"
                            onPress={() => {}}
                            loading={false}
                        />
                        <PrimaryButton
                            style={styles.button}
                            text="save"
                            onPress={() => {
                                setMode('view')
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
            </View>
            <BaseModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false)
                }}>
                <CreateLineModal
                    lines={lines}
                    setActiveLine={setActiveLine}
                    setLines={setLines}
                    setModalVisible={setModalVisible}
                />
            </BaseModal>
        </SafeAreaView>
    )
}

export default LineBuilder
