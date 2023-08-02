import { Platform } from 'react-native'
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions'
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads'

export const setupMobileAds = async () => {
    await requestPermissionsForAdvertising()
    await setMobileAdsConfiguration()
    await initializeMobileAds()
}

const setMobileAdsConfiguration = async () => {
    await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.T,
    })
}

const initializeMobileAds = async () => {
    await mobileAds().initialize()
}

const requestPermissionsForAdvertising = async () => {
    if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
        if (result === RESULTS.DENIED) {
            await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
        }
    }
}
