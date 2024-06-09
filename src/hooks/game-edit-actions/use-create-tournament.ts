import { ApiError } from '../../types/services'
import { BSON } from 'realm'
import { CREATE_TOURNAMENT_ERROR } from '../../utils/constants'
import { TournamentSchema } from '../../models'
import { createTournament } from '../../services/network/tournament'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withToken } from '../../services/data/auth'
import { LocalTournament, Tournament } from '../../types/tournament'

export const useCreateTournament = () => {
    const realm = useRealm()

    return useMutation<Tournament, ApiError, LocalTournament>(
        async (data: LocalTournament) => {
            try {
                const response = await withToken(createTournament, data)
                if (response.status !== 201)
                    throw new ApiError(CREATE_TOURNAMENT_ERROR)
                const { tournament } = response.data

                const schema = new TournamentSchema(tournament)
                realm.write(() => {
                    realm.create('Tournament', schema)
                })

                return tournament
            } catch (e) {
                const _id = new BSON.ObjectID().toHexString()
                const schema = new TournamentSchema({ _id, ...data })
                realm.write(() => {
                    realm.create('Tournament', schema)
                })

                return schema
            }
        },
    )
}
