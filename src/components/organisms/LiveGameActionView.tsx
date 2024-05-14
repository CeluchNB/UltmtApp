import SelectPlayersView from './SelectPlayersView'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

interface LiveGameActionView {
    next: () => {}
    back: () => {}
}

const LiveGameActionView: React.FC<{}> = () => {
    const [index, setIndex] = useState(0)

    return (
        <View>
            {index % 2 === 0 && <SelectPlayersView />}
            {index % 2 === 1 && (
                <Text
                    style={{
                        color: 'red',
                        fontSize: 32,
                        alignSelf: 'center',
                        marginTop: 50,
                    }}>
                    Create Actions
                </Text>
            )}
        </View>
    )
}

export default LiveGameActionView
