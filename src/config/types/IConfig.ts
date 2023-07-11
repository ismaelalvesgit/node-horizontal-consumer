export interface Configuration {
    port: number
    serviceName: string
    environment: string
    docs: {
        enabled: boolean
    }
    apm: {
        serverUrl: string
        apiKey?: string
        secretToken?: string
        cloudProvider?: string
    }
    backend: {
        core: string
    }
    kafka: {
        brokers: string[]
        connectionTimeout: number
        concurrently: number
    }
    timezone: string
}

export enum EEnvironmentType {
    Develop = "develop",
    Production = "production",
    Test = "test"
}