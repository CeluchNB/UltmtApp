import { DataTable } from 'react-native-paper'
import React from 'react'

interface CellData {
    key: number
    value: number | string
}

interface RowData {
    cells: CellData[]
}

interface HeaderData {
    key: number
    name: string
    numeric: boolean
}
interface TableData {
    headers: HeaderData[]
    rows: RowData[]
}

interface StatsTableProps {
    data: TableData
}

const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
    return (
        <DataTable>
            <DataTable.Header>
                {data.headers.map(({ name, numeric }) => {
                    return (
                        <DataTable.Title numeric={numeric}>
                            {name}
                        </DataTable.Title>
                    )
                })}
            </DataTable.Header>

            {data.rows.map(({ cells }) => {
                return (
                    <DataTable.Row>
                        {cells
                            .sort((a, b) => a.key - b.key)
                            .map(({ value }) => {
                                return <DataTable.Cell>{value}</DataTable.Cell>
                            })}
                    </DataTable.Row>
                )
            })}
        </DataTable>
    )
}

export default StatsTable
