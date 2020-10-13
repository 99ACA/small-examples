import { validateOrReject, ValidationError } from "class-validator";
import { plainToClass } from 'class-transformer';

//Remark: to acheive  better performance - use schema
export async function validator<T extends {} = {}>(validation: new (...args: any[]) => T, input: Object, forbidUnknownValues: boolean = false, skipMissingProperties: boolean = false): Promise<{ isValid: boolean, errorMsg?: string, validationErrors?: ValidationError[] }> {
    try {
        let validateObj = plainToClass(validation, input)
        await validateOrReject(validateObj, { validationError: { target: false }, forbidUnknownValues, skipMissingProperties });
        return { isValid: true }
    } catch (err) {
        let errorMsg = `Validation of ${validation.name} class failed. Validation errors: ${JSON.stringify(err)}`
        return { isValid: false, errorMsg, validationErrors: err }
    }
}
