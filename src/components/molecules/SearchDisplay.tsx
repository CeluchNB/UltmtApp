import React from 'react'
import SearchBar from '../atoms/SearchBar'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { ActivityIndicator, FlatList, ListRenderItem, View } from 'react-native'

interface SearchDisplayProps<T> {
    placeholder: string
    value?: string
    search: (q: string) => Promise<T[]>
    renderItem: ListRenderItem<T>
    onChangeText?: (text: string) => void
}

const SearchDisplay = <R,>(props: SearchDisplayProps<R>) => {
    const { placeholder, value = '', search, renderItem, onChangeText } = props
    const {
        theme: { colors },
    } = useTheme()

    const [query, setQuery] = React.useState(value)
    const { data, isLoading } = useQuery(
        ['search', query],
        () => search(query),
        { retry: 0, cacheTime: 0 },
    )

    const onSearch = (q: string) => {
        if (onChangeText) onChangeText(q)
        setQuery(q)
    }

    return (
        <View>
            <SearchBar
                placeholder={placeholder}
                onChangeText={onSearch}
                value={value}
                width={100}
            />
            {isLoading && (
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
