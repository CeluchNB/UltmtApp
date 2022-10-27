import { addQueryParam } from '../../utils/service-utils'
import { API_KEY, API_URL_V1 } from 'react-native-dotenv'
import axios, { AxiosResponse } from 'axios'

export const searchGames = async (
    q?: string,
    live?: boolean,
    after?: string,
    before?: string,
    pageSize?: number,
    offset?: number,
): Promise<AxiosResponse> => {
    let url = `${API_URL_V1}/game/search`
    url = addQueryParam(url, 'q', q)
    url = addQueryParam(url, 'live', live)
    url = addQueryParam(url, 'after', after)
    url = addQueryParam(url, 'before', before)
    url = addQueryParam(url, 'pageSize', pageSize)
    url = addQueryParam(url, 'offset', offset)
    return await axios.get(url, {
        headers: { 'X-API-Key': API_KEY },
    })
}
