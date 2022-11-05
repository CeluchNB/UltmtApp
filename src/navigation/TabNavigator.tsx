import * as Preferences from '../services/data/preferences'
import * as React from 'react'
import AccountNavigator from './../navigation/AccountNavigator'
import GameNavigator from './../navigation/GameNavigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { TopLevelProps } from '../types/navigation'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import { useColors } from './../hooks'

const Tab = createMaterialBottomTabNavigator()
const TabNavigator: React.FC<TopLevelProps> = ({ navigation }) => {
    const { colors, isDarkMode } = useColors()

    const [, updateState] = React.useState<any>()
    const forceUpdate = React.useCallback(() => updateState({}), [])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            // force update screen when dark mode setting has changed
            const newDarkMode = await Preferences.isDarkMode()
            if (isDarkMode !== newDarkMode) {
                forceUpdate()
            }
        })
        return unsubscribe
    }, [forceUpdate, navigation, isDarkMode])

    return (
        <Tab.Navigator
            activeColor={colors.textPrimary}
            inactiveColor={colors.gray}
            initialRouteName="Games"
            barStyle={{ backgroundColor: colors.darkPrimary }}>
            <Tab.Screen
                name="Account"
                component={AccountNavigator}
                options={{
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="account"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Games"
                component={GameNavigator}
                options={{
                    tabBarLabel: 'Games',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="home"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}

export default TabNavigator
