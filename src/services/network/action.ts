import { API_KEY, API_URL_V1 } from 'react-native-dotenv'
import axios, { AxiosResponse } from 'axios'

export const addComment = async (
    token: string,
    actionId: string,
    comment: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/action/${actionId}/comment`,
        { comment },
        {
            headers: {
                'X-API-Key': API_KEY,
                Authorization: `Bearer ${token}`,
            },
        },
    )
}
