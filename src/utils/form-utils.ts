export interface Rules<T> {
    required?: { value: boolean; message: string }
    minLength?: { value: number; message: string }
    maxLength?: { value: number; message: string }
    validate?: { validate: (v: T) => true | string }
}

export const getFormFieldRules = <T>(
    fieldName: string,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    validate?: [{ test: (v: T) => boolean; message: string }],
): Rules<T> => {
    const rules: Rules<T> = {}
    if (required) {
        rules.required = {
            value: true,
            message: `${fieldName} is required.`,
        }
    }

    if (minLength) {
        rules.minLength = {
            value: minLength,
            message: `${fieldName} must be at least ${minLength} characters.`,
        }
    }

    if (maxLength) {
        rules.maxLength = {
            value: maxLength,
            message: `${fieldName} cannot exceed ${maxLength} characters.`,
        }
    }

    if (validate) {
        rules.validate = {
            validate: (value: T) => {
                for (const v of validate) {
                    if (!v.test(value)) {
                        return v.message
                    }
                }
                return true
            },
        }
    }
    return rules
}

export const capitalizeFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.substring(1)
}

export const parseLiveValue = (value: string): boolean | undefined => {
    switch (value) {
        case 'true':
            return true
        case 'false':
            return false
        default:
            return undefined
    }
}
