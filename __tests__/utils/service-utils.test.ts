import { addQueryParam, isTokenExpired } from '../../src/utils/service-utils'

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

describe('test add query param', () => {
    it('with undefined query value', () => {
        const result = addQueryParam('url', 'name')
        expect(result).toBe('url')
    })

    it('with no query initiator', () => {
        const result = addQueryParam('url', 'name', 'value')
        expect(result).toBe('url?name=value')
    })

    it('with previous value', () => {
        const result = addQueryParam('url?q=s', 'name', 'value')
        expect(result).toBe('url?q=s&name=value')
    })
})
