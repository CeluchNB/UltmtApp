import * as ClaimGuestRequestServices from '../../../src/services/network/claim-guest-request'
import { AxiosResponse } from 'axios'
import {
    acceptClaimGuestRequest,
    createClaimGuestRequest,
    denyClaimGuestRequest,
    getClaimGuestRequests,
} from '../../../src/services/data/claim-guest-request'

describe('ClaimGuestRequest', () => {
    describe('createClaimGuestRequest', () => {
        it('succeeds', async () => {
            const spy = jest
                .spyOn(ClaimGuestRequestServices, 'createClaimGuestRequest')
                .mockReturnValue(Promise.resolve({} as AxiosResponse))

            await createClaimGuestRequest('guest', 'team')
            expect(spy).toHaveBeenCalled()
        })

        it('fails', async () => {
            jest.spyOn(
                ClaimGuestRequestServices,
                'createClaimGuestRequest',
            ).mockRejectedValue({ message: 'test' })

            await expect(
                createClaimGuestRequest('guest', 'team'),
            ).rejects.toBeDefined()
        })
    })

    describe('getClaimGuestRequests', () => {
        it('succeeds', async () => {
            const requests = [{ _id: 'request1' }, { _id: 'request2' }]
            jest.spyOn(
                ClaimGuestRequestServices,
                'getClaimGuestRequests',
            ).mockReturnValue(
                Promise.resolve({
                    data: { requests },
                } as AxiosResponse),
            )

            const result = await getClaimGuestRequests('team')
            expect(result).toMatchObject(requests)
        })

        it('fails', async () => {
            jest.spyOn(
                ClaimGuestRequestServices,
                'getClaimGuestRequests',
            ).mockRejectedValue({ message: 'test' })

            await expect(getClaimGuestRequests('team')).rejects.toBeDefined()
        })
    })

    describe('acceptClaimGuestRequest', () => {
        it('succeeds', async () => {
            const request = { _id: 'request' }
            jest.spyOn(
                ClaimGuestRequestServices,
                'acceptClaimGuestRequest',
            ).mockReturnValue(
                Promise.resolve({ data: { request } } as AxiosResponse),
            )

            const result = await acceptClaimGuestRequest('request')
            expect(result).toMatchObject(request)
        })

        it('fails', async () => {
            jest.spyOn(
                ClaimGuestRequestServices,
                'acceptClaimGuestRequest',
            ).mockRejectedValue({ message: 'test error' })

            await expect(
                acceptClaimGuestRequest('request'),
            ).rejects.toBeDefined()
        })
    })

    describe('denyClaimGuestRequest', () => {
        it('succeeds', async () => {
            const request = { _id: 'request' }
            jest.spyOn(
                ClaimGuestRequestServices,
                'denyClaimGuestRequest',
            ).mockReturnValue(
                Promise.resolve({ data: { request } } as AxiosResponse),
            )

            const result = await denyClaimGuestRequest('request')
            expect(result).toMatchObject(request)
        })

        it('fails', async () => {
            jest.spyOn(
                ClaimGuestRequestServices,
                'denyClaimGuestRequest',
            ).mockRejectedValue({ message: 'test' })

            await expect(denyClaimGuestRequest('request')).rejects.toBeDefined()
        })
    })
})
