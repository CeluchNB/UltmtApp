import BaseScreen from '../../components/atoms/BaseScreen'
import { CreateGameContext } from '../../context/create-game-context'
import GameCard from '../../components/atoms/GameCard'
import JoinByCodeModal from '../../components/molecules/JoinByCodeModal'
import { JoinGameProps } from '../../types/navigation'
import SearchDisplay from '../../components/molecules/SearchDisplay'
import { searchGames } from '../../services/data/game'
import { useJoinGame } from '../../hooks/game-edit-actions/use-join-game'
import React, { useContext } from 'react'

const JoinGameScreen: React.FC<JoinGameProps> = ({ navigation }) => {
    const { teamOne } = useContext(CreateGameContext)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [gameId, setGameId] = React.useState('')

    const { isLoading, error, mutateAsync } = useJoinGame()

    React.useEffect(() => {
        navigation.setOptions({ title: `Join Game with ${teamOne?.name}` })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamOne])

    const onSearch = async (q: string) => {
        if (q.length > 3) {
            return await searchGames(q, true, undefined, undefined, 20, 0)
        }
        return []
    }

    const onSubmit = async (data: { code: string }) => {
        const { code } = data
        if (!code) {
            return
        }

        try {
            await mutateAsync({ gameId, code })
            setModalVisible(false)
            navigation.navigate('LiveGame', {
                screen: 'FirstPoint',
                params: { gameId, team: 'two' },
            })
        } catch {}
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
                    if (!item) return null
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
                loading={isLoading}
                error={error?.message ?? ''}
                onClose={onClose}
                onSubmit={onSubmit}
            />
        </BaseScreen>
    )
}

export default JoinGameScreen
