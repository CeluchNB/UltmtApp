import { AddGuestProps } from '../../types/navigation'
import BaseScreen from '../../components/atoms/BaseScreen'
import React from 'react'
import { ScrollView, Text } from 'react-native'

const AddGuestScreen: React.FC<AddGuestProps> = ({ route }) => {
    const { teamId } = route.params

    console.log('team id', teamId)
    return (
        <BaseScreen containerWidth={90}>
            <ScrollView>
                <Text>Add Guests</Text>
            </ScrollView>
        </BaseScreen>
    )
}

export default AddGuestScreen
