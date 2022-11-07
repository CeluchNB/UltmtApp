import * as PointServices from '../../../src/services/network/point'
import Point from '../../../src/types/point'
import { createPoint } from '../../../src/services/data/point'

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOneActive: true,
    teamTwoActive: true,
    teamOneActions: [],
    teamTwoActions: [],
    teamOneScore: 0,
    teamTwoScore: 0,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    pullingTeam: { name: 'Team 1' },
    receivingTeam: { name: 'Team 2' },
}

describe('test create point', () => {
    it('should handle network success', async () => {
        jest.spyOn(PointServices, 'createPoint').mockReturnValueOnce(
            Promise.resolve({
                data: { point },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )

        const result = await createPoint(true, 1)
        expect(result).toMatchObject(point)
    })

    it('should handle network failure', async () => {
        jest.spyOn(PointServices, 'createPoint').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(createPoint(true, 1)).rejects.toThrow()
    })
})
