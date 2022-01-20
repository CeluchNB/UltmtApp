import * as React from 'react'
import { Picker } from '@react-native-picker/picker'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import UserInput from '../components/atoms/UserInput'
import { useColors } from '../hooks'
import { StyleSheet, View } from 'react-native'

const CreateTeamScreen: React.FC<{}> = () => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: { alignSelf: 'center' },
        input: {
            width: '75%',
            alignSelf: 'center',
            marginTop: 20,
        },
        picker: {
            color: colors.textPrimary,
            width: '75%',
            alignSelf: 'center',
        },
        button: {
            marginTop: 20,
            alignSelf: 'center',
        },
    })

    const currentYear = new Date().getFullYear()
    const years = [
        currentYear.toString(),
        `${currentYear} - ${currentYear + 1}`,
        (currentYear + 1).toString(),
    ]

    const [selectedYear, setSelectedYear] = React.useState(years[0])

    return (
        <View style={styles.screen}>
            <ScreenTitle style={styles.title} title="Create Team" />
            <UserInput style={styles.input} placeholder="Team City" />
            <UserInput style={styles.input} placeholder="Team Name" />
            <Picker
                style={styles.picker}
                selectedValue={selectedYear}
                prompt="Season"
                onValueChange={itemValue => setSelectedYear(itemValue)}>
                {years.map(value => {
                    return (
                        <Picker.Item value={value} label={value} key={value} />
                    )
                })}
            </Picker>
            <PrimaryButton
                style={styles.button}
                text="Create"
                onPress={() => ({})}
                loading={false}
            />
        </View>
    )
}

export default CreateTeamScreen
