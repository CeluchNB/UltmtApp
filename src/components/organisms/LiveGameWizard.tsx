import PrimaryButton from '../atoms/PrimaryButton'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

const LiveGameWizard: React.FC<{}> = () => {
    const [index, setIndex] = useState(0)

    return (
        <View>
            {index % 2 === 0 && (
                <Text
                    style={{
                        color: 'red',
                        fontSize: 32,
                        alignSelf: 'center',
                        marginTop: 50,
                    }}>
                    Select Players
                </Text>
            )}
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
            <View
                style={{
                    flexDirection: 'row',
                }}>
                <PrimaryButton
                    style={{ flex: 1 }}
                    text="Set Players"
                    loading={false}
                    onPress={() => setIndex(curr => Math.max(curr - 1, 0))}
                />
                <PrimaryButton
                    style={{ flex: 1 }}
                    text="Next Point"
                    loading={false}
                    onPress={() => setIndex(curr => curr + 1)}
                />
            </View>
        </View>
    )
}

export default LiveGameWizard
