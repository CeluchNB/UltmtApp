import React from 'react'
import SearchBar from '../atoms/SearchBar'
import { useColors } from '../../hooks/useColors'
import { useLazyData } from '../../hooks'
import { ActivityIndicator, FlatList, ListRenderItem, View } from 'react-native'

interface SearchDisplayProps<T> {
    placeholder: string
    value?: string
    search: (q: string) => Promise<T[]>
    renderItem: ListRenderItem<T>
    onChangeText?: (text: string) => void
}

const SearchDisplay = <R,>(props: SearchDisplayProps<R>) => {
    const { placeholder, value, search, renderItem, onChangeText } = props
    const { colors } = useColors()
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