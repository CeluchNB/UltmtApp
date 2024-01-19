import ActionStack from '../utils/action-stack'
import EventEmitter from 'eventemitter3'
import { LocalPointEvents } from '../types/point'
import { TeamNumber } from '../types/team'
import { ClientActionData, LiveServerActionData } from '../types/action'
import { useEffect, useState } from 'react'

// Handles common functionality for all live game use cases
const useLivePoint = (emitter: EventEmitter) => {
    const [actionStack, setActionStack] = useState(new ActionStack())
    const [error, setError] = useState<string>()
    const [waitingForActionResponse, setWaitingForActionResponse] =
        useState(false)

    useEffect(() => {
        emitter.addListener(LocalPointEvents.ACTION_LISTEN, onActionReceived)
        emitter.addListener(LocalPointEvents.UNDO_LISTEN, onUndoReceived)
        emitter.addListener(LocalPointEvents.ERROR_LISTEN, onActionError)
        // TODO: this needs to be use case specific, probably don't need this here
        // emitter.addListener('point:next:client:local', onNextPoint)
        // TODO: handle comments

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Listeners
    const onActionReceived = (data: LiveServerActionData) => {
        setActionStack({ ...actionStack.reconcileAction(data) })
        setWaitingForActionResponse(false)
    }

    const onUndoReceived = (data: {
        team: TeamNumber
        actionNumber: number
    }) => {
        setActionStack({ ...actionStack.undoAction(data) })
        setWaitingForActionResponse(false)
    }

    const onActionError = (data: any) => {
        setError(data?.message ?? data?.toString())
    }

    // TODO: this needs to be use case specific, probably don't even need this here
    // const onNextPoint = () => {}

    // Emits
    const onAction = (action: ClientActionData) => {
        setWaitingForActionResponse(true)
        emitter.emit(LocalPointEvents.ACTION_EMIT, action)
    }

    const onUndo = () => {
        setWaitingForActionResponse(true)
        emitter.emit(LocalPointEvents.UNDO_EMIT)
    }

    const onNextPoint = () => {
        emitter.emit(LocalPointEvents.NEXT_POINT_EMIT)
    }

    const onComment = (
        jwt: string,
        actionNumber: number,
        teamNumber: string,
        comment: string,
    ) => {
        emitter.emit(
            LocalPointEvents.COMMENT_EMIT,
            jwt,
            actionNumber,
            teamNumber,
            comment,
        )
    }

    const onDeleteComment = (
        jwt: string,
        actionNumber: number,
        teamNumber: string,
        commentNumber: number,
    ) => {
        emitter.emit(
            LocalPointEvents.DELETE_COMMENT_EMIT,
            jwt,
            actionNumber,
            teamNumber,
            commentNumber,
        )
    }

    return {
        actionStack,
        error,
        waitingForActionResponse,
        setActionStack,
        onAction,
        onUndo,
        onNextPoint,
        onComment,
        onDeleteComment,
    }
}

export default useLivePoint
