import { Platform } from 'react-native'

export const androidLog = (...message: string[]) => {
    if (Platform.OS === 'android') {
        console.log('ANDROID:', ...message)
    }
}
export const iosLog = (...message: string[]) => {
    if (Platform.OS === 'ios') {
        console.log('IOS:', ...message)
    }
}
