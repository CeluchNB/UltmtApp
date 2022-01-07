import { ApiResponse } from '../../types/services'
export const login = async (
    username: string,
    password: string,
): Promise<ApiResponse> => {
    const response = await fetch('https://ultmt-dev.herokuapp.com/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
        },
        body: JSON.stringify({
            email: username,
            password: password,
        }),
    })

    if (response.ok) {
        return { data: await response.json(), error: undefined }
    } else {
        throw new Error(await response.text())
    }
}
