import Point from '../types/point'
import { getViewableActionsByPoint } from '../services/data/point'
import { isLivePoint } from '../utils/point'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

const useSavedPoint = (point?: Point) => {
    const {
        data: teamOneActions,
        isLoading: teamOneLoading,
        error: teamOneError,
    } = useQuery(
        [{ point: point?._id, team: 'one' }],
        () =>
            getViewableActionsByPoint(
                'one',
                point?._id ?? '',
                point?.teamOneActions ?? [],
            ),
        {
            enabled: point && !isLivePoint(point),
        },
    )
    const {
        data: teamTwoActions,
        isLoading: teamTwoLoading,
        error: teamTwoError,
    } = useQuery(
        [{ point: point?._id, team: 'two' }],
        () =>
            getViewableActionsByPoint(
                'two',
                point?._id ?? '',
                point?.teamTwoActions ?? [],
            ),
        {
            enabled: point && !isLivePoint(point),
        },
    )

    const loading = useMemo(() => {
        return teamOneLoading || teamTwoLoading
    }, [teamOneLoading, teamTwoLoading])

    const error = useMemo(() => {
        return teamOneError ?? teamTwoError
    }, [teamOneError, teamTwoError])

    return { teamOneActions, teamTwoActions, loading, error }
}

export default useSavedPoint
