import { IHeaders } from "kafkajs";

export interface IConsumerProps {
    name: string
    topic: string
    timeout: number
    retryCount?: number
    retryEnable?: boolean
    execute: (mensage: IConsumerMessage) => Promise<void>
}

export interface IConsumer {
    execute(mensage: IConsumerMessage): Promise<void>
    get props(): IConsumerProps
}

export interface IConsumerMessageEntry {
    key: Buffer | null
    value: unknown
    timestamp: string
    attributes: number
    offset: string
    size?: number
    headers?: IHeaders
}

export interface IConsumerMessage {
    identify: string
    partition: number
    message: IConsumerMessageEntry
}