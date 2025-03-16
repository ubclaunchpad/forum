


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

export class UserStatusError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "UserStatusError"
    }
}
// export class ValidationError extends Error {
//     constructor(message: string) {
//         super(message)
//     }
// }

export class StorageError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "StorageError"
    }
}

export class StorageBucketNotFoundError extends StorageError {
    constructor(message: string) {
        super(message)
        this.name = "StorageBucketNotFoundError"
    }
}


export class DuplicateBucketError  extends StorageError {
    constructor(message: string) {
        super(message)
        this.name = "DuplicateBucketError"
    }
}
export class PermissionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PermissionError";
    }
}
