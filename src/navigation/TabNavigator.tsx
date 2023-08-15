import * as React from 'react'
import AccountNavigator from './../navigation/AccountNavigator'
import { AllScreenProps } from '../types/navigation'
import GameNavigator from './../navigation/GameNavigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import { useTheme } from './../hooks'

const Tab = createMaterialBottomTabNavigator()

const AccountIcon = ({ color }: { color: string }) => (
    <MaterialCommunityIcons name="account" color={color} size={26} />
)

const HomeIcon = ({ color }: { color: string }) => (
    <MaterialCommunityIcons name="home" color={color} size={26} />
)

const TabNavigator: React.FC<AllScreenProps> = () => {
    const {
        theme: { colors },
    } = useTheme()

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
                    tabBarIcon: AccountIcon,
                }}
            />
            <Tab.Screen
                name="Games"
                component={GameNavigator}
                options={{
                    tabBarLabel: 'Games',
                    tabBarIcon: HomeIcon,
                }}
            />
        </Tab.Navigator>
    )
}

export default TabNavigator
