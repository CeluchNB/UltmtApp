import * as React from 'react'
import { IconButton } from 'react-native-paper'
import { useColors } from '../../hooks'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface UserSearchResultItemProps {
    name: string
    username: string
}

const UserSearchResultItem: React.FC<UserSearchResultItemProps> = ({
    name,
    username,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            margin: 5,
        },
        nameContainer: {
            flex: 1,
            alignSelf: 'center',
        },
        name: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.full,
        },
        username: {
            color: colors.textSecondary,
            fontSize: size.fontFifteen,
            fontWeight: weight.full,
        },
        buttonStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    })

    return (
        <View>
            <TouchableOpacity style={styles.container}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.username}>{username}</Text>
                </View>
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.success}
                    icon="plus"
                    onPress={() => {}}
                />
            </TouchableOpacity>
        </View>
    )
}

export default UserSearchResultItem
