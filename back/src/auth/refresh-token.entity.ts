import { sign } from 'jsonwebtoken';

// TODO créer une vraie entity dans la db etc etc 

export default class RefreshToken {
    constructor(init?: Partial<RefreshToken>) {
        Object.assign(this, init);
    }

    id: number;
    userId: number;

    sign(): string {
        return sign({ ...this }, process.env.REFRESH_SECRET);
    }
}
