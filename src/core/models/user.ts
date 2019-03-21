export class User {

    uid: string;
    name?: string;
    phoneNumber?: string;
    status: any;

    constructor(data: any) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}
