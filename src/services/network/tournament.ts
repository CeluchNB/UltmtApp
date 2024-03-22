import { LocalTournament } from '../../types/tournament'
import { API_KEY, API_URL_V1 } from '@env'
import axios, { AxiosResponse } from 'axios'

export const createTournament = async (
    token: string,
    createTournamentData: LocalTournament,
): Promise<AxiosResponse> => {
    const controller = new AbortController()

    // this prevents this request from taking forever in airplane mode
    setTimeout(() => {
        controller.abort()
    }, 5000)

    return axios.post(
        `${API_URL_V1}/tournament`,
        {
            createTournamentData,
        },
        {
            headers: {
                'X-API-Key': API_KEY,
                Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
        },
    )
}

export const searchTournaments = async (q: string): Promise<AxiosResponse> => {
    return axios.get(`${API_URL_V1}/tournament/search?q=${q}`, {
        headers: {
            'X-API-Key': API_KEY,
        },
    })
}
