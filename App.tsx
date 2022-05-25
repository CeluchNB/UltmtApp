import * as React from 'react'
import AccountNavigator from './src/navigation/AccountNavigator'
import GameNavigator from './src/navigation/GameNavigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { NavigationContainer } from '@react-navigation/native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import { useColors } from './src/hooks'

const Tab = createMaterialBottomTabNavigator()

const App: React.FC<{}> = () => {
    const { colors } = useColors()
    return (
        <NavigationContainer>
            <Tab.Navigator
                activeColor={colors.textPrimary}
                inactiveColor={colors.gray}
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
        </NavigationContainer>
    )
}

export default App
