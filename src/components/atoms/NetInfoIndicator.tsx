import { useColors } from '../../hooks'
import { useNetInfo } from '@react-native-community/netinfo'
import { IconButton, Tooltip } from 'react-native-paper'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

const NetInfoIndicator: React.FC<{}> = () => {
    const { colors } = useColors()
    const netInfo = useNetInfo()
    const [iconName, setIconName] = useState('network-strength-3')
    const [iconColor, setIconColor] = useState(colors.success)
    const [tooltipText, setTooltipText] = useState('Good Internet connection')

    useEffect(() => {
        if (!netInfo.isInternetReachable) {
            setIconColor(colors.error)
            setIconName('network-strength-1')
            setTooltipText('Poor Internet connection. Consider offline game.')
        } else {
            setIconColor(colors.success)
            setIconName('network-strength-3')
            setTooltipText('Good Internet connection')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [netInfo])

    const styles = StyleSheet.create({
        container: { display: 'flex', flexDirection: 'row' },
        button: { margin: 0 },
    })

    return (
        <View style={styles.container}>
            <IconButton
                style={styles.button}
                iconColor={iconColor}
                icon={iconName}
                size={20}
            />
            <Tooltip title={tooltipText} enterTouchDelay={200}>
                <IconButton
                    style={styles.button}
                    iconColor={colors.textPrimary}
                    icon="help-circle"
                    size={20}
                    onPress={() => {}}
                />
            </Tooltip>
        </View>
    )
}

export default NetInfoIndicator
