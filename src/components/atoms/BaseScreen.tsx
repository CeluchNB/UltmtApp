import React from 'react'
import { useTheme } from '../../hooks'
import { SafeAreaView, StyleSheet, View } from 'react-native'

interface BaseScreenProps {
    containerWidth: string
    children?: React.ReactNode
}

const BaseScreen: React.FC<BaseScreenProps> = props => {
    const { containerWidth, children } = props
    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        container: {
            width: containerWidth,
            alignSelf: 'center',
        },
    })
    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>{children}</View>
        </SafeAreaView>
    )
}

export default BaseScreen
