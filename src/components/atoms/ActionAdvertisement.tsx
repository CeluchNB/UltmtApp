import { Platform } from 'react-native'
import React from 'react'
import { ANDROID_AD_UNIT_ID, IOS_AD_UNIT_ID } from '@env'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'

const ActionAdvertisement: React.FC<{}> = () => {
    const unitId = React.useMemo(() => {
        if (process.env.NODE_ENV === 'production') {
            return Platform.OS === 'ios' ? IOS_AD_UNIT_ID : ANDROID_AD_UNIT_ID
        } else {
            return TestIds.BANNER
        }
    }, [])

    return <BannerAd unitId={unitId} size={BannerAdSize.BANNER} />
}

export default ActionAdvertisement
