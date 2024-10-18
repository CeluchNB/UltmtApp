import BaseModal from '../../components/atoms/BaseModal'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import { DisplayUser } from '../../types/user'
import { Line } from '../../types/game'
import { LineBuilderProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import UserInput from '../../components/atoms/UserInput'
import { nameSort } from '../../utils/player'
import { useSelectPlayers } from '../../hooks/game-edit-actions/use-select-players'
import { useTheme } from '../../hooks'
import { Button, Chip, IconButton } from 'react-native-paper'
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { GameSchema, LineSchema } from '../../models'
import React, { useState } from 'react'
import { useObject, useQuery, useRealm } from '../../context/realm'

interface CreateLineModalProps {
    setModalVisible: (value: boolean) => void
    onCreate: (lineName: string) => void
}
const CreateLineModal: React.FC<CreateLineModalProps> = props => {
    const {
        theme: { colors, size },
    } = useTheme()
    const [lineName, setLineName] = useState('')

    const { setModalVisible, onCreate } = props

    const styles = StyleSheet.create({
        input: { width: 200, marginBottom: 10 },
    })

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
                style={styles.input}
                placeholder="Line name"
                onChangeText={text => {
                    setLineName(text)
                }}
            />
            <PrimaryButton
                text="done"
                onPress={() => {
                    onCreate(lineName)
                    setLineName('')
                    setModalVisible(false)
                }}
                loading={false}
            />
        </>
    )
}

interface ViewLineListProps {
    players: DisplayUser[]
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
    selectedPlayers: DisplayUser[]
    players: DisplayUser[]
    toggleSelection: (player: DisplayUser) => void
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

type LineBuilderState = 'add' | 'view' | 'edit'

export const LineBuilder: React.FC<LineBuilderProps> = ({ route }) => {
    const { gameId, teamId } = route.params

    const {
        theme: { colors, size },
    } = useTheme()

    const [lines, setLines] = useState<Line[]>([])
    const [activeLine, setActiveLine] = useState<number | undefined>(undefined)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [deletingLine, setDeletingLine] = useState<number | undefined>(
        undefined,
    )
    const [initialSelectedPlayers, setInitialSelectedPlayers] = useState<
        DisplayUser[]
    >([])
    const { selectedPlayers, toggleSelection, clearSelection } =
        useSelectPlayers(initialSelectedPlayers)
    const [mode, setMode] = useState<LineBuilderState>('add')

    const realm = useRealm()
    const gameLines = useQuery<LineSchema>('Line').filtered(
        `gameId == '${gameId}'`,
    )
    const game = useObject<GameSchema>('Game', gameId)
    const players =
        game?.teamOne._id === teamId
            ? game.teamOnePlayers
            : game?.teamTwoPlayers

    const onSelectLine = (item: Line, index: number) => {
        setActiveLine(index)
        setInitialSelectedPlayers(item.players)
        setMode('view')

        if (!players) return
        for (const player of players) {
            if (
                selectedPlayers.findIndex(p => p._id === player._id) > -1 &&
                item.players.findIndex(p => p._id === player._id) === -1
            ) {
                toggleSelection(player)
            } else if (
                selectedPlayers.findIndex(p => p._id === player._id) === -1 &&
                item.players.findIndex(p => p._id === player._id) > -1
            ) {
                toggleSelection(player)
            }
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
        lineContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        button: {
            marginBottom: 10,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.pageContainer}>
                <View style={styles.contentContainer}>
                    {gameLines.length === 0 ? (
                        <Text style={styles.noLineWarning}>
                            No lines created yet
                        </Text>
                    ) : (
                        <View style={styles.listContainer}>
                            <FlatList
                                data={gameLines}
                                renderItem={({ item, index }) => {
                                    return (
                                        <View style={styles.lineContainer}>
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
                                                {item.name} (
                                                {item.players.length})
                                            </Button>
                                            <IconButton
                                                icon="delete"
                                                iconColor={colors.error}
                                                onPress={() => {
                                                    // open delete modal
                                                    setDeletingLine(index)
                                                    setDeleteModalVisible(true)
                                                }}
                                            />
                                        </View>
                                    )
                                }}
                            />
                            {mode === 'add' || mode === 'view' ? (
                                <ViewLineList
                                    players={lines[
                                        activeLine ?? 0
                                    ]?.players.sort(nameSort)}
                                />
                            ) : (
                                <EditLineList
                                    players={
                                        players?.slice().sort(nameSort) ?? []
                                    }
                                    selectedPlayers={selectedPlayers}
                                    toggleSelection={toggleSelection}
                                />
                            )}
                        </View>
                    )}
                </View>
                {mode === 'view' && (
                    <>
                        <PrimaryButton
                            style={styles.button}
                            text="edit"
                            onPress={() => {
                                setMode('edit')
                            }}
                            loading={false}
                        />
                        <SecondaryButton
                            text="cancel"
                            onPress={async () => {
                                setMode('add')
                            }}
                        />
                    </>
                )}
                {mode === 'add' && (
                    <SecondaryButton
                        style={styles.button}
                        text="add line"
                        onPress={async () => {
                            setAddModalVisible(true)
                        }}
                    />
                )}
                {mode === 'edit' && (
                    <>
                        <PrimaryButton
                            style={styles.button}
                            text="save"
                            onPress={() => {
                                setMode('add')
                                setLines(curr => {
                                    curr[activeLine ?? 0].players =
                                        selectedPlayers
                                    return curr
                                })
                                gameLines
                            }}
                            loading={false}
                        />
                        <SecondaryButton
                            text="cancel"
                            onPress={async () => {
                                setMode('add')
                                setActiveLine(
                                    lines.length - 1 >= 0 ? 0 : undefined,
                                )
                            }}
                        />
                    </>
                )}
            </View>
            <BaseModal
                visible={addModalVisible}
                onClose={() => {
                    setAddModalVisible(false)
                }}>
                <CreateLineModal
                    setModalVisible={setAddModalVisible}
                    onCreate={lineName => {
                        if (lineName.length === 0) return

                        clearSelection()
                        setLines(curr =>
                            curr.concat({
                                gameId,
                                name: lineName,
                                players: [],
                            }),
                        )
                        realm.write(() => {
                            realm.create(
                                'Line',
                                new LineSchema({
                                    gameId,
                                    name: lineName,
                                    players: [],
                                }),
                            )
                        })

                        setActiveLine(lines.length)
                        setMode('edit')
                    }}
                />
            </BaseModal>

            <ConfirmModal
                visible={deleteModalVisible}
                displayText="Are you sure you want to delete this line?"
                loading={false}
                confirmColor={colors.error}
                onCancel={async () => setDeleteModalVisible(false)}
                onClose={async () => setDeleteModalVisible(false)}
                onConfirm={async () => {
                    setActiveLine(
                        lines.length - 1 > 0 ? lines.length - 2 : undefined,
                    )
                    setLines(curr => {
                        return curr.filter(
                            (line, index) => index !== deletingLine,
                        )
                    })
                    setDeletingLine(undefined)
                    setDeleteModalVisible(false)
                    setMode('add')
                }}
            />
        </SafeAreaView>
    )
}

export default LineBuilder
