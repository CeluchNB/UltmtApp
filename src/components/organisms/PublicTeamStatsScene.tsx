import React from 'react'
import { View } from 'react-native'
import { getTeamStats } from '../../services/data/stats'
import { useQuery } from 'react-query'

interface PublicTeamStatsSceneProps {
    teamId: string
}

const PublicTeamStatsScene: React.FC<PublicTeamStatsSceneProps> = ({
    teamId,
}) => {
    const { data, error } = useQuery(['getTeamStats', { teamId }], () =>
        getTeamStats(teamId),
    )

    return <View />
}

export default PublicTeamStatsScene
