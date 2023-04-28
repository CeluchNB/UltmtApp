import { API_KEY, API_URL_V1 } from '@env'
import axios, { AxiosResponse } from 'axios'

export const getPlayerStats = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/stats/player/${id}`, {
        headers: {
            'X-API-Key': API_KEY,
        },
    })
}
