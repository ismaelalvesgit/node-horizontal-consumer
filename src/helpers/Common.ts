export default class Common {
    static delay(value: number): Promise<void> {
        return new Promise( resolve => setTimeout(resolve, value) );
    }

    static jsonDeserializer(value: Buffer | null): unknown {
        if (!value) {
            return {};
        }

        const stringifiedValue = value?.toString();
        try {
            return JSON.parse(stringifiedValue);
        } catch (error) {
            return {};
        }
    }
}