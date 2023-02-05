import React from 'react'
import SearchBar from '../atoms/SearchBar'
import { ActivityIndicator, FlatList, ListRenderItem, View } from 'react-native'
import { useLazyData, useTheme } from '../../hooks'

interface SearchDisplayProps<T> {
    placeholder: string
    value?: string
    search: (q: string) => Promise<T[]>
    renderItem: ListRenderItem<T>
    onChangeText?: (text: string) => void
}

const SearchDisplay = <R,>(props: SearchDisplayProps<R>) => {
    const { placeholder, value, search, renderItem, onChangeText } = props
    const {
        theme: { colors },
    } = useTheme()
    const { data, loading, fetch } = useLazyData(search)

    const onSearch = (q: string) => {
        if (onChangeText) onChangeText(q)
        fetch(q)
    }

    return (
        <View>
            <SearchBar
                placeholder={placeholder}
                onChangeText={onSearch}
                value={value}
                width="100%"
            />
            {loading && (
                <ActivityIndicator
                    color={colors.textPrimary}
                    testID="search-indicator"
                />
            )}
            {data && <FlatList data={data} renderItem={renderItem} />}
        </View>
    )
}

export default SearchDisplay
