import { LocalTournament } from '../../types/tournament'
import { API_KEY, API_URL_V1 } from '@env'
import axios, { AxiosResponse } from 'axios'

export const createTournament = async (
    token: string,
    createTournamentData: LocalTournament,
): Promise<AxiosResponse> => {
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
