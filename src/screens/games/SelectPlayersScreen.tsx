import BaseScreen from '../../components/atoms/BaseScreen'
import { Chip } from 'react-native-paper'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { SelectPlayersProps } from '../../types/navigation'
import { selectPoint } from '../../store/reducers/features/point/livePointReducer'
import { setPlayers } from '../../store/reducers/features/point/livePointReducer'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { FlatList, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import {
    selectGame,
    selectTeam,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

const SelectPlayersScreen: React.FC<SelectPlayersProps> = () => {
    const { colors } = useColors()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
    const dispatch = useDispatch()

    const playerList = React.useMemo(() => {
        const players = []
        if (team === 'one') {
            players.push(...game.teamOnePlayers)
        } else {
            players.push(...game.teamTwoPlayers)
        }
        return players
    }, [game, team])

    const isPulling = (): boolean => {
        if (team === 'one') {
            return point.pullingTeam._id === game.teamOne._id
        } else {
            return point.pullingTeam._id !== game.teamOne._id
        }
    }

    // no guaranteed unique attribute of GuestPlayer
    // must select by id
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
        chip: {
            borderRadius: 8,
            margin: 5,
            backgroundColor: colors.primary,
            borderWidth: 2,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle title="Select Players" />
            <Text style={styles.description}>
                {game.playersPerPoint} Players on next {isPulling() ? 'D' : 'O'}{' '}
                point
            </Text>
            <FlatList
                numColumns={2}
                data={playerList}
                renderItem={({ item, index }) => {
                    return (
                        <Chip
                            style={styles.chip}
                            mode="outlined"
                            onPress={() => {
                                toggleSelection(index)
                            }}
                            selectedColor={colors.textPrimary}
                            ellipsizeMode="tail"
                            selected={selectedPlayers.includes(index)}>
                            {item.firstName} {item.lastName}
                        </Chip>
                    )
                }}
            />
            <PrimaryButton
                text="start"
                disabled={selectedPlayers.length !== game.playersPerPoint}
                onPress={onSetPlayers}
                loading={false}
            />
        </BaseScreen>
    )
}

export default SelectPlayersScreen
