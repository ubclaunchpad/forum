


// export class DatabaseError extends Error {
//     constructor(message: string) {
//         super(message)
//     }
// }

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class InputValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "InputValidationError"
    }
}

export class AuthError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AuthError"
    }
}
// export class ValidationError extends Error {
//     constructor(message: string) {
//         super(message)
//     }
// }