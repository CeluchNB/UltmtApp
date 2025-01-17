import { BSON } from 'realm'
import BaseModal from '../../components/atoms/BaseModal'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import { LineBuilderProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import UserInput from '../../components/atoms/UserInput'
import { nameSort } from '../../utils/player'
import { useSelectPlayers } from '../../hooks/game-edit-actions/use-select-players'
import { useTheme } from '../../hooks'
import { Button, Chip, IconButton } from 'react-native-paper'
import { DisplayUser, InGameStatsUser } from '../../types/user'
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { GameSchema, LineSchema } from '../../models'
import React, { useMemo, useState } from 'react'
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
    players: { player: InGameStatsUser; selected: boolean }[]
    toggleSelection: (player: DisplayUser) => void
}

const EditLineList: React.FC<EditLineListParams> = ({
    toggleSelection,
    players,
}) => {
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
                        selectedColor={
                            item.selected ? colors.textPrimary : colors.gray
                        }
                        onPress={() => toggleSelection(item.player)}>
                        {item.player.firstName} {item.player.lastName}
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

    const realm = useRealm()
    const game = useObject<GameSchema>('Game', gameId)
    const players =
        game?.teamOne._id === teamId
            ? game?.teamOnePlayers
            : game?.teamTwoPlayers

    const { playerOptions, toggleSelection, clearSelection, toggleLine } =
        useSelectPlayers(gameId, players ?? [])

    const realmLines = useQuery<LineSchema>('Line').filtered(
        `gameId == '${gameId}'`,
    )
    const gameLines = useMemo(() => {
        return (realmLines ?? []).map(line => ({
            ...new LineSchema(line),
            _id: line._id,
        }))
    }, [realmLines])

    const [mode, setMode] = useState<LineBuilderState>('add')
    const [activeLine, setActiveLine] = useState<LineSchema | undefined>(
        gameLines?.[0],
    )
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [deletingLine, setDeletingLine] = useState<BSON.ObjectId | undefined>(
        undefined,
    )

    const onSelectLine = (line?: LineSchema) => {
        if (!line) return

        setActiveLine(line)
        setMode('view')
        clearSelection()
        toggleLine(line._id?.toHexString() ?? '')
    }

    const onSave = () => {
        const line = realm.objectForPrimaryKey<LineSchema>(
            'Line',
            activeLine?._id,
        )
        if (!line) return

        setMode('add')
        realm.write(() => {
            const newPlayers = Object.values(playerOptions)
                .filter(p => p.selected)
                .map(p => p.player)

            line.players = newPlayers
        })
    }

    const onDelete = async () => {
        const line = realm.objectForPrimaryKey<LineSchema>('Line', deletingLine)
        if (!line) return

        setActiveLine((gameLines?.length ?? 0) > 0 ? gameLines?.[0] : undefined)
        realm.write(() => {
            realm.delete(line)
        })
        setDeletingLine(undefined)
        setDeleteModalVisible(false)
        setMode('add')
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
                    {gameLines?.length === 0 ? (
                        <Text style={styles.noLineWarning}>
                            No lines created yet
                        </Text>
                    ) : (
                        <View style={styles.listContainer}>
                            <FlatList
                                data={gameLines ?? []}
                                renderItem={({ item }) => {
                                    return (
                                        <View style={styles.lineContainer}>
                                            <Button
                                                mode="text"
                                                textColor={
                                                    activeLine?._id?.toHexString() ===
                                                    item._id?.toHexString()
                                                        ? colors.textPrimary
                                                        : colors.gray
                                                }
                                                rippleColor={`${colors.textPrimary}44`}
                                                onPress={() =>
                                                    onSelectLine(item)
                                                }>
                                                {item.name} (
                                                {item.players.length})
                                            </Button>
                                            <IconButton
                                                icon="delete"
                                                iconColor={colors.error}
                                                onPress={() => {
                                                    // open delete modal
                                                    setDeletingLine(item._id)
                                                    setDeleteModalVisible(true)
                                                }}
                                                testID="delete-button"
                                            />
                                        </View>
                                    )
                                }}
                            />
                            {mode === 'add' || mode === 'view' ? (
                                <ViewLineList
                                    players={
                                        activeLine?.players
                                            ?.slice()
                                            .sort(nameSort) ?? []
                                    }
                                />
                            ) : (
                                <EditLineList
                                    players={Object.values(playerOptions).sort(
                                        (p1, p2) =>
                                            nameSort(p1.player, p2.player),
                                    )}
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
                            onPress={onSave}
                            loading={false}
                        />
                        <SecondaryButton
                            text="cancel"
                            onPress={async () => {
                                setMode('add')
                                setActiveLine(
                                    gameLines?.[(gameLines?.length ?? 0) - 1],
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

                        const line = new LineSchema({
                            gameId,
                            name: lineName,
                            players: [],
                        })
                        clearSelection()
                        realm.write(() => {
                            realm.create('Line', line)
                        })
                        setActiveLine(line)
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
                onConfirm={onDelete}
            />
        </SafeAreaView>
    )
}

export default LineBuilder
