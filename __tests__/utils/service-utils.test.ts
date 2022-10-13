import { isTokenExpired } from '../../src/utils/service-utils'

describe('test is token expired', () => {
    it('with expired token', () => {
        const result = isTokenExpired(1000)
        expect(result).toBe(true)
    })
    it('with valid token', () => {
        const result = isTokenExpired(new Date().getTime())
        expect(result).toBe(false)
    })
})
