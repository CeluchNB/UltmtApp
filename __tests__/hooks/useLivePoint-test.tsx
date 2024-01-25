import EventEmitter from 'eventemitter3'
import { LocalPointEvents } from '../../src/types/point'
import useLivePoint from '../../src/hooks/useLivePoint'
import { ActionType, LiveServerActionData } from '../../src/types/action'
import { act, renderHook } from '@testing-library/react-native'

describe('useLivePoint', () => {
    describe('listens to', () => {
        it('action', () => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))

            const action: LiveServerActionData = {
                actionNumber: 3,
                actionType: ActionType.CATCH,
                teamNumber: 'one',
                comments: [],
                tags: [],
            }
            act(() => {
                emitter.emit(LocalPointEvents.ACTION_LISTEN, action)
            })

            expect(
                result.current.actionStack.getTeamOneActions(),
            ).toMatchObject([action])
        })

        it('undo', () => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))

            const action: LiveServerActionData = {
                actionNumber: 3,
                actionType: ActionType.CATCH,
                teamNumber: 'one',
                comments: [],
                tags: [],
            }
            act(() => {
                emitter.emit(LocalPointEvents.ACTION_LISTEN, action)
            })

            expect(
                result.current.actionStack.getTeamOneActions(),
            ).toMatchObject([action])

            act(() => {
                emitter.emit(LocalPointEvents.UNDO_LISTEN, {
                    team: 'one',
                    actionNumber: 3,
                })
            })

            expect(
                result.current.actionStack.getTeamOneActions(),
            ).toMatchObject([])
        })

        it('error', () => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))
            act(() => {
                emitter.emit(LocalPointEvents.ERROR_LISTEN, 'test error')
            })

            expect(result.current.error).toBe('test error')
        })

        it('next point', () => {
            const onNextPoint = jest.fn()
            const emitter = new EventEmitter()
            renderHook(() => useLivePoint(emitter, { onNextPoint }))
            act(() => {
                emitter.emit(LocalPointEvents.NEXT_POINT_LISTEN)
            })
            expect(onNextPoint).toHaveBeenCalled()
        })
    })

    describe('emits', () => {
        it('action', done => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))

            const testData = { data: 'test' }
            emitter.on(LocalPointEvents.ACTION_EMIT, data => {
                expect(data).toMatchObject(testData)
                done()
            })

            act(() => {
                result.current.onAction(testData as any)
            })
        })

        it('undo', done => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))

            emitter.on(LocalPointEvents.UNDO_EMIT, data => {
                expect(data).toBeUndefined()
                done()
            })

            act(() => {
                result.current.onUndo()
            })
        })

        it('next point', done => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))

            emitter.on(LocalPointEvents.NEXT_POINT_EMIT, data => {
                expect(data).toBeUndefined()
                done()
            })

            act(() => {
                result.current.onNextPoint()
            })
        })

        it('comment', done => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))

            const commentData = {
                jwt: 'test',
                actionNumber: 1,
                teamNumber: 'one',
                comment: 'test',
            }
            emitter.on(
                LocalPointEvents.COMMENT_EMIT,
                (jwt, actionNumber, teamNumber, comment) => {
                    expect({
                        jwt,
                        actionNumber,
                        teamNumber,
                        comment,
                    }).toMatchObject(commentData)
                    done()
                },
            )

            act(() => {
                result.current.onComment(
                    commentData.jwt,
                    commentData.actionNumber,
                    commentData.teamNumber,
                    commentData.comment,
                )
            })
        })

        it('delete comment', done => {
            const emitter = new EventEmitter()
            const { result } = renderHook(() => useLivePoint(emitter))

            const commentData = {
                jwt: 'test',
                actionNumber: 1,
                teamNumber: 'one',
                commentNumber: 1,
            }
            emitter.on(
                LocalPointEvents.DELETE_COMMENT_EMIT,
                (jwt, actionNumber, teamNumber, commentNumber) => {
                    expect({
                        jwt,
                        actionNumber,
                        teamNumber,
                        commentNumber,
                    }).toMatchObject(commentData)
                    done()
                },
            )

            act(() => {
                result.current.onDeleteComment(
                    commentData.jwt,
                    commentData.actionNumber,
                    commentData.teamNumber,
                    commentData.commentNumber,
                )
            })
        })
    })
})
