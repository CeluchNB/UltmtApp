import ActionStack from '../utils/action-stack'
import EventEmitter from 'eventemitter3'
import { TeamNumber } from '../types/team'
import usePointSocket from './usePointSocket'
import { ClientActionData, LiveServerActionData } from '../types/action'
import { useEffect, useMemo, useState } from 'react'

// Handles common functionality for all live game use cases
const usePoint = (gameId: string, pointId: string) => {
    usePointSocket(gameId, pointId)

    const [emitter] = useState(new EventEmitter())
    const [actionMap, setActionMap] = useState(new ActionStack())
    const [error, setError] = useState<string>()

    const teamOneActions = useMemo(() => {
        return actionMap.getTeamOneActions()
    }, [actionMap])

    const teamTwoActions = useMemo(() => {
        return actionMap.getTeamTwoActions()
    }, [actionMap])

    useEffect(() => {
        emitter.addListener('action:client:local', onActionReceived)
        emitter.addListener('action:undo:client:local', onUndoReceived)
        emitter.addListener('action:error:local', onActionError)
        // TODO: this needs to be use case specific, probably don't need this here
        // emitter.addListener('point:next:client:local', onNextPoint)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Listeners
    const onActionReceived = (data: LiveServerActionData) => {
        setActionMap(actionMap.reconcileAction(data))
    }

    const onUndoReceived = (data: {
        team: TeamNumber
        actionNumber: number
    }) => {
        setActionMap(actionMap.undoAction(data))
    }

    const onActionError = (data: any) => {
        setError(data?.message ?? data?.toString())
    }

    // TODO: this needs to be use case specific, probably don't even need this here
    // const onNextPoint = () => {}

    // Emits
    const onAction = (action: ClientActionData) => {
        emitter.emit('action', action)
    }

    const onUndo = () => {
        emitter.emit('action:undo')
    }

    const onNextPoint = () => {
        emitter.emit('point:next')
    }

    const onComment = (
        jwt: string,
        actionNumber: number,
        teamNumber: string,
        comment: string,
    ) => {
        emitter.emit('action:comment', jwt, actionNumber, teamNumber, comment)
    }

    const onDeleteComment = (
        jwt: string,
        actionNumber: number,
        teamNumber: string,
        commentNumber: number,
    ) => {
        emitter.emit(
            'action:comment:delete',
            jwt,
            actionNumber,
            teamNumber,
            commentNumber,
        )
    }

    return {
        teamOneActions,
        teamTwoActions,
        error,
        onAction,
        onUndo,
        onNextPoint,
        onComment,
        onDeleteComment,
    }
}

export default usePoint
