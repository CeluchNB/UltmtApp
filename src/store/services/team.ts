import { ApiResponse } from '../../types/services'
import { CreateTeam } from '../../types/team'

export const createTeam = async (
    token: string,
    data: CreateTeam,
): Promise<ApiResponse> => {
    const response = await fetch('https://ultmt-dev.herokuapp.com/team', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            team: {
                ...data,
            },
        }),
    })

    if (response.ok) {
        return { data: await response.json() }
    } else {
        return { error: await response.text() }
    }
}
