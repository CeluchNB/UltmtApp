import * as Constants from '../../utils/constants'
import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import { ActionType } from '../../types/action'
import { ApiError } from '../../types/services'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { LiveGameProps } from '../../types/navigation'
import PlayerActionView from '../../components/organisms/PlayerActionView'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TeamActionView from '../../components/organisms/TeamActionView'
import { getValidTeamActions } from '../../utils/action'
import { nextPoint } from '../../services/data/live-action'
import { useColors } from '../../hooks'
import useLiveGameState from '../../hooks/useLiveGameState'
import { StyleSheet, Text, View } from 'react-native'
import { createPoint, finishPoint } from '../../services/data/point'
import { isPulling, isPullingNext } from '../../utils/point'
import {
    selectGame,
    selectTeam,
    updateScore,
} from '../../store/reducers/features/game/liveGameReducer'
import {
    selectPoint,
    setPoint,
} from '../../store/reducers/features/point/livePointReducer'
import { size, weight } from '../../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const LivePointEditScreen: React.FC<LiveGameProps> = ({ navigation }) => {
    // hooks
    const { colors } = useColors()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const dispatch = useDispatch()
    const [finishLoading, setFinishLoading] = React.useState(false)
    const [finishError, setFinishError] = React.useState<string | undefined>(
        undefined,
    )

    const {
        actions,
        lastAction,
        activePlayers,
        waiting,
        error,
        onPlayerAction,
        onTeamAction,
        onUndo,
    } = useLiveGameState()

    const onFinishPoint = async () => {
        try {
            setFinishLoading(true)
            setFinishError(undefined)
            const prevPoint = await finishPoint(point._id)
            const { teamOneScore, teamTwoScore } = prevPoint
            dispatch(updateScore({ teamOneScore, teamTwoScore }))

            const newPoint = await createPoint(
                isPullingNext(team, lastAction?.actionType),
                point.pointNumber + 1,
            )
            dispatch(setPoint(newPoint))
            nextPoint(prevPoint._id)

            navigation.reset({ index: 0, routes: [{ name: 'SelectPlayers' }] })
        } catch (e) {
            setFinishError(
                (e as ApiError).message ?? Constants.FINISH_POINT_ERROR,
            )
        } finally {
            setFinishLoading(false)
        }
    }

    const styles = StyleSheet.create({
        error: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
        header: {
            color: colors.textPrimary,
            fontSize: size.fontMedium,
            fontWeight: weight.full,
            margin: 5,
        },
    })

    return (
        <BaseScreen containerWidth="80%">
            <GameHeader game={game} />
            <PlayerActionView
                players={activePlayers}
                pulling={isPulling(point, game, team)}
                prevAction={lastAction?.actionType}
                activePlayer={lastAction?.playerOne?._id}
                undoDisabled={!lastAction}
                loading={waiting}
                error={error}
                onAction={onPlayerAction}
                onUndo={onUndo}
            />
            <TeamActionView
                actions={getValidTeamActions(actions)}
                onAction={onTeamAction}
            />
            <PrimaryButton
                onPress={onFinishPoint}
                text="finish point"
                loading={finishLoading}
                disabled={
                    finishLoading ||
                    (lastAction?.actionType !== ActionType.TEAM_ONE_SCORE &&
                        lastAction?.actionType !== ActionType.TEAM_TWO_SCORE)
                }
            />
            {finishError && <Text style={styles.error}>{finishError}</Text>}
            {actions.length > 0 && (
                <View>
                    <Text style={styles.header}>Last Action</Text>
                    <ActionDisplayItem
                        action={actions[actions.length - 1]}
                        teamOne={game.teamOne}
                        teamTwo={game.teamTwo}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default LivePointEditScreen
