import { getFormFieldRules } from '../../src/utils/form-utils'

it('should return rules with all parameters set', () => {
    const rules: any = getFormFieldRules('field', true, 2, 10, [
        {
            test: (v: string) => {
                return v.includes('s')
            },
            message: 'message',
        },
    ])

    expect(rules.required.value).toBe(true)
    expect(rules.required.message).toBe('field is required.')
    expect(rules.minLength.value).toBe(2)
    expect(rules.minLength.message).toBe('field must be at least 2 characters.')
    expect(rules.maxLength.value).toBe(10)
    expect(rules.maxLength.message).toBe('field cannot exceed 10 characters.')
    expect(rules.validate.validate('asdf')).toBe(true)
    expect(rules.validate.validate('hjk')).toBe('message')
})
