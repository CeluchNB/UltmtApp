import { API_KEY, API_URL_V1 } from 'react-native-dotenv'
import axios, { AxiosResponse } from 'axios'

export const createPoint = async (
    gameToken: string,
    pulling: boolean,
    pointNumber: number,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/point?pulling=${pulling}&number=${pointNumber}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${gameToken}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}
