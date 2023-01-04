import * as Constants from '../../utils/constants'
import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import { ActionType } from '../../types/action'
import { ApiError } from '../../types/services'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { LiveGameProps } from '../../types/navigation'
import LivePointStatus from '../../components/molecules/LivePointStatus'
import PlayerActionView from '../../components/organisms/PlayerActionView'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TeamActionView from '../../components/organisms/TeamActionView'
import { getValidTeamActions } from '../../utils/action'
import { isPulling } from '../../utils/point'
import { useColors } from '../../hooks'
import { useGameEditor } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

const LivePointEditScreen: React.FC<LiveGameProps> = ({ navigation }) => {
    // hooks
    const { colors } = useColors()
    const [finishLoading, setFinishLoading] = React.useState(false)
    const [finishError, setFinishError] = React.useState<string | undefined>(
        undefined,
    )

    const {
        actions,
        activePlayers,
        error,
        game,
        lastAction,
        myTeamActions,
        point,
        waiting,
        team,
        onPlayerAction,
        onTeamAction,
        onUndo,
        onFinishPoint: finishPoint,
    } = useGameEditor()

    const onFinishPoint = async () => {
        try {
            setFinishLoading(true)
            setFinishError(undefined)
            await finishPoint()

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
            <LivePointStatus
                error={error}
                loading={waiting}
                undoDisabled={myTeamActions.length === 0}
                onUndo={onUndo}
            />
            <PlayerActionView
                players={activePlayers}
                pulling={isPulling(point, game, team)}
                prevAction={lastAction?.actionType}
                activePlayer={lastAction?.playerOne?._id}
                loading={waiting}
                onAction={onPlayerAction}
            />
            <TeamActionView
                actions={getValidTeamActions(myTeamActions)}
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
