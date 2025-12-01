import { BadRequestException } from "@nestjs/common";

export class UUID {
    private readonly _value: string;
    
    private constructor(value: string){
        this._value = value;
    }

    static create(): UUID {
        return new UUID(crypto.randomUUID());
    }

    static fromString(value: string): UUID {
        if(!this.isValidUUID(value)) {
            throw new BadRequestException('Invalid UUID format');
        }

        return new UUID(value);
    }

    private static isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    getValue(): string {
        return this._value;
    }

    equals(other: UUID): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}