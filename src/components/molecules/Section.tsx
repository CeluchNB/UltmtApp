import * as React from 'react'
import { Button } from 'react-native-paper'
import { Text, View } from 'react-native'

const Section: React.FC<{ title: string }> = ({ title }) => {
    return (
        <View>
            <Text>{title}</Text>
            <Button mode="text">Next Section</Button>
        </View>
    )
}

export default Section
