export interface MutationData {
    mutate: () => Promise<void>
    isLoading: boolean
    error?: string
}
