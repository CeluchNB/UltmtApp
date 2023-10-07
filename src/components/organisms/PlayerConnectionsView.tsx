import { Dropdown } from 'react-native-element-dropdown'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

const PlayerConnectionsView: React.FC<{}> = () => {
    const {
        theme: { colors, size },
    } = useTheme()

    const playerData = [
        { label: 'Player 1', value: '1' },
        { label: 'Player 2', value: '2' },
        { label: 'Player 3', value: '3' },
        { label: 'Player 4', value: '4' },
        { label: 'Player 5', value: '5' },
    ]
    const [playerOneValue, setPlayerOneValue] = React.useState('')
    const [playerTwoValue, setPlayerTwoValue] = React.useState('')

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textSecondary,
        },
        dropdownContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        dropdown: {
            flexGrow: 1,
            borderWidth: 0.5,
            borderColor: colors.textSecondary,
            borderRadius: 4,
            padding: 4,
            color: colors.textPrimary,
        },
        toText: {
            color: colors.gray,
            fontSize: size.fontFifteen,
            marginHorizontal: 5,
            alignSelf: 'center',
        },
        errorText: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            textAlign: 'center',
        },
        selectedTextStyle: {
            color: colors.textPrimary,
        },
        containerStyle: {
            backgroundColor: colors.darkPrimary,
            borderColor: colors.darkPrimary,
        },
        itemTextStyle: { color: colors.darkGray },
    })

    return (
        <View>
            <Text style={styles.title}>Player Connections</Text>
            <View style={styles.dropdownContainer}>
                <Dropdown
                    style={styles.dropdown}
                    selectedTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.containerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor={colors.textSecondary}
                    data={playerData}
                    labelField="label"
                    valueField="value"
                    onChange={v => setPlayerOneValue(v.value)}
                    value={playerOneValue}
                    placeholder="Player One"
                />
                <Text style={styles.toText}>to</Text>
                <Dropdown
                    style={styles.dropdown}
                    selectedTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.containerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor={colors.textSecondary}
                    data={playerData}
                    labelField="label"
                    valueField="value"
                    onChange={v => setPlayerTwoValue(v.value)}
                    value={playerTwoValue}
                    placeholder="Player Two"
                />
            </View>
            <View>
                <Text style={styles.errorText}>
                    No connections from Player One to Player Two
                </Text>
            </View>
        </View>
    )
}

export default PlayerConnectionsView
