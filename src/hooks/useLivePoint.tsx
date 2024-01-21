import ActionStack from '../utils/action-stack'
import EventEmitter from 'eventemitter3'
import { LocalPointEvents } from '../types/point'
import { TeamNumber } from '../types/team'
import { ClientActionData, LiveServerActionData } from '../types/action'
import { useEffect, useState } from 'react'

interface LivePointOptions {
    onNextPoint: () => void
}
// Handles common functionality for all live game use cases
const useLivePoint = (emitter: EventEmitter, options?: LivePointOptions) => {
    const [actionStack, setActionStack] = useState(new ActionStack())
    const [error, setError] = useState<string>()
    const [waitingForActionResponse, setWaitingForActionResponse] =
        useState(false)

    useEffect(() => {
        emitter.removeListener(LocalPointEvents.ACTION_LISTEN)
        emitter.addListener(LocalPointEvents.ACTION_LISTEN, onActionReceived)

        emitter.removeListener(LocalPointEvents.UNDO_LISTEN)
        emitter.addListener(LocalPointEvents.UNDO_LISTEN, onUndoReceived)

        emitter.removeListener(LocalPointEvents.ERROR_LISTEN)
        emitter.addListener(LocalPointEvents.ERROR_LISTEN, onActionError)

        emitter.removeListener(LocalPointEvents.NEXT_POINT_LISTEN)
        emitter.addListener(
            LocalPointEvents.NEXT_POINT_LISTEN,
            onNextPointReceived,
        )

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Listeners
    const onActionReceived = (data: LiveServerActionData) => {
        setActionStack(curr => ({ ...curr.reconcileAction(data) }))
        setWaitingForActionResponse(false)
    }

    const onUndoReceived = (data: {
        team: TeamNumber
        actionNumber: number
    }) => {
        setActionStack(curr => ({ ...curr.undoAction(data) }))
        setWaitingForActionResponse(false)
    }

    const onActionError = (data: any) => {
        setError(data?.message ?? data?.toString())
    }

    const onNextPointReceived = () => {
        options?.onNextPoint()
    }

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
