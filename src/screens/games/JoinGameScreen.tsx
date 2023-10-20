import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameCard from '../../components/atoms/GameCard'
import JoinByCodeModal from '../../components/molecules/JoinByCodeModal'
import { JoinGameProps } from '../../types/navigation'
import React from 'react'
import SearchDisplay from '../../components/molecules/SearchDisplay'
import { setPoint } from '../../store/reducers/features/point/livePointReducer'
import {
    getPointsByGame,
    joinGame,
    searchGames,
} from '../../services/data/game'
import {
    selectTeamOne,
    setGame,
    setTeam,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

const JoinGameScreen: React.FC<JoinGameProps> = ({ navigation }) => {
    const dispatch = useDispatch()
    const teamTwo = useSelector(selectTeamOne)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [gameId, setGameId] = React.useState('')
    const [joinLoading, setJoinLoading] = React.useState(false)
    const [joinError, setJoinError] = React.useState('')

    React.useEffect(() => {
        navigation.setOptions({ title: `Join Game with ${teamTwo.name}` })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamTwo])

    const onSearch = async (q: string) => {
        if (q.length > 3) {
            const after = new Date()
            after.setDate(after.getDate() - 2)
            return await searchGames(
                q,
                true,
                after.toDateString(),
                undefined,
                20,
                0,
            )
        }
        return []
    }

    const onSubmit = async (data: { code: string }) => {
        const { code } = data
        if (!code) {
            return
        }
        setJoinError('')
        setJoinLoading(true)
        try {
            // create game and set live game in redux
            const game = await joinGame(gameId, teamTwo._id, code)
            dispatch(
                setGame({
                    ...game,
                    startTime: game.startTime.toString(),
                    tournament: undefined,
                }),
            )
            dispatch(setTeam('two'))

            // get current points, if any exist, set most recent one as current point
            const points = await getPointsByGame(gameId)
            if (points.length > 0) {
                dispatch(
                    setPoint(
                        points.sort((a, b) => a.pointNumber - b.pointNumber)[
                            points.length - 1
                        ],
                    ),
                )
            }

            setModalVisible(false)
            navigation.navigate('LiveGame', { screen: 'FirstPoint' })
        } catch (e: any) {
            setJoinError(e?.message ?? Constants.JOIN_GAME_ERROR)
        } finally {
            setJoinLoading(false)
        }
    }

    const onClose = () => {
        setModalVisible(false)
    }

    return (
        <BaseScreen containerWidth={80}>
            <SearchDisplay
                placeholder="Search Games..."
                search={onSearch}
                renderItem={({ item }) => {
                    return (
                        <GameCard
                            game={item}
                            onPress={() => {
                                setGameId(item._id)
                                setModalVisible(true)
                            }}
                        />
                    )
                }}
            />
            <JoinByCodeModal
                visible={modalVisible}
                loading={joinLoading}
                error={joinError}
                onClose={onClose}
                onSubmit={onSubmit}
            />
        </BaseScreen>
    )
}

export default JoinGameScreen
