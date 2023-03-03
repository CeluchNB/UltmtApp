import React from 'react'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'

const ActionAdvertisement: React.FC<{}> = () => {
    return <BannerAd unitId={TestIds.BANNER} size={BannerAdSize.BANNER} />
}

export default ActionAdvertisement
