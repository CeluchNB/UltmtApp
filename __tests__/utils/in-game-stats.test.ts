import { ActionType } from '../../src/types/action'
import { InGameStatsUser } from '../../src/types/user'
import {
    addInGameStatsPlayers,
    generatePlayerStatsForPoint,
    initializeInGameStatsPlayers,
    subtractInGameStatsPlayers,
    updateInGameStatsPlayers,
} from '../../src/utils/in-game-stats'

const playerOne = {
    _id: 'player1',
    firstName: 'First 1',
    lastName: 'Last 1',
    username: 'first1last1',
}

const playerTwo = {
    _id: 'player2',
    firstName: 'First 2',
    lastName: 'Last 2',
    username: 'first1last2',
}

const playerThree = {
    _id: 'player3',
    firstName: 'First 3',
    lastName: 'Last 3',
    username: 'first3last3',
}

const playerList: InGameStatsUser[] = [
    {
        ...playerOne,
        assists: 1,
        goals: 0,
        blocks: 1,
        turnovers: 0,
        pointsPlayed: 1,
    },
    {
        ...playerTwo,
        assists: 0,
        goals: 1,
        blocks: 1,
        turnovers: 1,
        pointsPlayed: 3,
    },
]

describe('In Game Stats Utils', () => {
    describe('addInGameStatsPlayers', () => {
        it('correctly adds players', () => {
            const result = addInGameStatsPlayers(playerList, [
                ...playerList,
                {
                    ...playerThree,
                    assists: 0,
                    blocks: 0,
                    goals: 0,
                    turnovers: 0,
                    pointsPlayed: 0,
                },
            ])
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...playerList[0],
                        assists: 2,
                        goals: 0,
                        blocks: 2,
                        turnovers: 0,
                        pointsPlayed: 2,
                    }),
                    expect.objectContaining({
                        ...playerList[1],
                        assists: 0,
                        goals: 2,
                        blocks: 2,
                        turnovers: 2,
                        pointsPlayed: 6,
                    }),
                ]),
            )
        })
    })

    describe('generatePlayerStatsForPoint', () => {
        it('adds assist', () => {
            const result = generatePlayerStatsForPoint(
                [playerOne],
                [
                    {
                        teamNumber: 'one',
                        actionNumber: 1,
                        actionType: ActionType.TEAM_ONE_SCORE,
                        playerOne: playerTwo,
                        playerTwo: playerOne,
                        comments: [],
                        tags: [],
                    },
                ],
            )

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...playerOne,
                        assists: 1,
                        pointsPlayed: 1,
                    }),
                ]),
            )
        })

        it('adds goal', () => {
            const result = generatePlayerStatsForPoint(
                [playerOne],
                [
                    {
                        teamNumber: 'one',
                        actionNumber: 1,
                        actionType: ActionType.TEAM_ONE_SCORE,
                        playerOne,
                        playerTwo,
                        comments: [],
                        tags: [],
                    },
                ],
            )

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...playerOne,
                        goals: 1,
                        pointsPlayed: 1,
                    }),
                ]),
            )
        })

        it('adds block', () => {
            const result = generatePlayerStatsForPoint(
                [playerOne],
                [
                    {
                        teamNumber: 'one',
                        actionNumber: 1,
                        actionType: ActionType.BLOCK,
                        playerOne,
                        comments: [],
                        tags: [],
                    },
                ],
            )

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...playerOne,
                        blocks: 1,
                        pointsPlayed: 1,
                    }),
                ]),
            )
        })

        it('adds turnovers', () => {
            const result = generatePlayerStatsForPoint(
                [playerOne],
                [
                    {
                        teamNumber: 'one',
                        actionNumber: 1,
                        actionType: ActionType.DROP,
                        playerOne,
                        comments: [],
                        tags: [],
                    },
                    {
                        teamNumber: 'one',
                        actionNumber: 2,
                        actionType: ActionType.THROWAWAY,
                        playerOne,
                        comments: [],
                        tags: [],
                    },
                ],
            )

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...playerOne,
                        turnovers: 2,
                        pointsPlayed: 1,
                    }),
                ]),
            )
        })
    })

    describe('initializeInGameStatsPlayers', () => {
        it('adds necessary properties', () => {
            const result = initializeInGameStatsPlayers([
                playerOne,
                playerTwo,
                playerOne,
            ])
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...playerOne,
                        pointsPlayed: 0,
                        assists: 0,
                        blocks: 0,
                        goals: 0,
                        turnovers: 0,
                    }),
                    expect.objectContaining({
                        ...playerTwo,
                        pointsPlayed: 0,
                        assists: 0,
                        blocks: 0,
                        goals: 0,
                        turnovers: 0,
                    }),
                ]),
            )
        })
    })

    describe('subtractInGameStatsPlayers', () => {
        it('accurately subtracts data', () => {
            const result = subtractInGameStatsPlayers(playerList, [
                ...playerList,
                {
                    ...playerThree,
                    assists: 0,
                    blocks: 0,
                    goals: 0,
                    turnovers: 0,
                    pointsPlayed: 0,
                },
            ])
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...playerOne,
                        pointsPlayed: 0,
                        assists: 0,
                        blocks: 0,
                        goals: 0,
                        turnovers: 0,
                    }),
                    expect.objectContaining({
                        ...playerTwo,
                        pointsPlayed: 0,
                        assists: 0,
                        blocks: 0,
                        goals: 0,
                        turnovers: 0,
                    }),
                ]),
            )
        })
    })

    describe('updateInGameStatsPlayers', () => {
        it('correctly updates', () => {
            const result = updateInGameStatsPlayers(playerList, [
                playerOne,
                playerThree,
            ])
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(playerList[0]),
                    expect.objectContaining(playerList[1]),
                    expect.objectContaining({
                        ...playerThree,
                        assists: 0,
                        blocks: 0,
                        goals: 0,
                        pointsPlayed: 0,
                        turnovers: 0,
                    }),
                ]),
            )
        })
    })
})
