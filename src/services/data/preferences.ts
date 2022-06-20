import EncryptedStorage from 'react-native-encrypted-storage'

export const setDarkMode = async (isDark: boolean) => {
    await EncryptedStorage.setItem('dark_mode', isDark.toString())
}

export const isDarkMode = async (): Promise<boolean> => {
    return (await EncryptedStorage.getItem('dark_mode')) !== 'false'
}
