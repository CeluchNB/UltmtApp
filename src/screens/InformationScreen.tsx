import BaseScreen from '../components/atoms/BaseScreen'
import { Button } from 'react-native-paper'
import React from 'react'
import { useTheme } from '../hooks'
import { Linking, StyleSheet, Text, View } from 'react-native'

const InformationScreen: React.FC<{}> = () => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const date = new Date().getFullYear()

    const styles = StyleSheet.create({
        paragraphText: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            marginTop: 10,
            marginBottom: 10,
        },
        emailContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        emailText: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
        },
        companyText: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
            fontWeight: weight.bold,
            alignSelf: 'center',
            marginTop: 20,
        },
    })
    return (
        <BaseScreen containerWidth="80%">
            <View>
                <Text style={styles.paragraphText}>
                    The Ultmt App is developed and maintained by a small team in
                    Pittsburgh, PA.
                </Text>
                <View style={styles.emailContainer}>
                    <Text style={styles.emailText}>Email </Text>
                    <Button
                        mode="text"
                        textColor={colors.textPrimary}
                        onPress={() => {
                            Linking.openURL('mailto:developer@theultmtapp.com')
                        }}>
                        developer@theultmtapp.com
                    </Button>
                    <Text style={styles.emailText}>for help.</Text>
                </View>
                <Text style={styles.companyText}>The Ultmt App {date}</Text>
            </View>
        </BaseScreen>
    )
}

export default InformationScreen
