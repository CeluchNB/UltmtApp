import BaseScreen from '../atoms/BaseScreen'
import React from 'react'
import SearchBar from '../atoms/SearchBar'
import { useColors } from '../../hooks/useColors'
import { useLazyData } from '../../hooks'
import { ActivityIndicator, FlatList, ListRenderItem } from 'react-native'

interface SearchDisplayProps<T> {
    search: (q: string) => Promise<T[]>
    renderItem: ListRenderItem<T>
}

const SearchDisplay = <R,>(props: SearchDisplayProps<R>) => {
    const { search, renderItem } = props
    const { colors } = useColors()
    const { data, loading, fetch } = useLazyData(search)

    const onSearch = (q: string) => {
        fetch(q)
    }

    return (
        <BaseScreen containerWidth="80%">
            <SearchBar placeholder="Search teams..." onChangeText={onSearch} />
            {loading && <ActivityIndicator color={colors.textPrimary} />}
            {data && <FlatList data={data} renderItem={renderItem} />}
        </BaseScreen>
    )
}

export default SearchDisplay
