import { ApiResponse } from '../../types/services'

export const requestTeam = async (
    token: string,
    teamId: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/user?team=${teamId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (response.ok) {
        return { data: await response.json() }
    } else {
        const error = JSON.parse(await response.text())
        return { error }
    }
}
