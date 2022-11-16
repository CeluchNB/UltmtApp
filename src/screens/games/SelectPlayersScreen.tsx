import BaseScreen from '../../components/atoms/BaseScreen'
import { Chip } from 'react-native-paper'
import GameHeader from '../../components/molecules/GameHeader'
import GuestPlayerModal from '../../components/molecules/GuestPlayerModal'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { SelectPlayersProps } from '../../types/navigation'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { FlatList, LogBox, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import {
    selectGame,
    selectTeam,
} from '../../store/reducers/features/game/liveGameReducer'
import {
    selectPoint,
    selectSetPlayersError,
    selectSetPlayersStatus,
    setPlayers,
} from '../../store/reducers/features/point/livePointReducer'
import { useDispatch, useSelector } from 'react-redux'

const SelectPlayersScreen: React.FC<SelectPlayersProps> = () => {
    // ignore flatlist flex wrap warning
    LogBox.ignoreLogs(['`flexWrap: `wrap`` is'])
    const { colors } = useColors()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const status = useSelector(selectSetPlayersStatus)
    const error = useSelector(selectSetPlayersError)
    const dispatch = useDispatch()
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
    const [modalVisible, setModalVisible] = useState(false)

    const playerList = React.useMemo(() => {
        if (team === 'one') {
            return game.teamOnePlayers
        }
        return game.teamTwoPlayers
    }, [game, team])

    const isPulling = (): boolean => {
        if (team === 'one') {
            return point.pullingTeam._id === game.teamOne._id
        } else {
            return point.pullingTeam._id !== game.teamOne._id
        }
    }

    // no guaranteed unique attribute of GuestPlayer
    // must select by index
    const toggleSelection = (i: number) => {
        if (selectedPlayers.includes(i)) {
            setSelectedPlayers(prev => {
                return prev.filter(s => s !== i)
            })
        } else {
            setSelectedPlayers([i, ...selectedPlayers])
        }
    }

    const onSetPlayers = async () => {
        const players = playerList.filter((p, i) => selectedPlayers.includes(i))
        dispatch(setPlayers({ players }))
    }

    const styles = StyleSheet.create({
        description: {
            color: colors.gray,
            fontSize: size.fontLarge,
            marginBottom: 10,
            textAlign: 'center',
        },
        flatListContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
            marginTop: 10,
        },
        button: {
            marginTop: 10,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <Text style={styles.description}>
                {game.playersPerPoint} players on next {isPulling() ? 'D' : 'O'}
                -point
            </Text>
            <FlatList
                contentContainerStyle={styles.flatListContainer}
                data={playerList}
                renderItem={({ item, index }) => {
                    return (
                        <Chip
                            style={styles.chip}
                            mode="outlined"
                            onPress={() => {
                                toggleSelection(index)
                            }}
                            selectedColor={
                                selectedPlayers.includes(index)
                                    ? colors.textPrimary
                                    : colors.gray
                            }
                            ellipsizeMode="tail">
                            {item.firstName} {item.lastName}
                        </Chip>
                    )
                }}
            />
            {status === 'failed' && (
                <Text style={styles.errorText}>{error}</Text>
            )}
            <SecondaryButton
                style={styles.button}
                onPress={async () => {
                    setModalVisible(true)
                }}
                text="add guest"
            />
            <PrimaryButton
                style={styles.button}
                text="start"
                disabled={selectedPlayers.length !== game.playersPerPoint}
                onPress={onSetPlayers}
                loading={status === 'loading'}
            />
            <GuestPlayerModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false)
                }}
            />
        </BaseScreen>
    )
}

export default SelectPlayersScreen
