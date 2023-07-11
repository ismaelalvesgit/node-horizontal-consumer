import { IHeaders, RecordMetadata } from "kafkajs";

export interface IKafkaProducerParams <IEntity> {
    topic: string
    data: IEntity[] | IEntity, 
    headers?: IHeaders
}

export interface IKafkaProducer {
    execute<IEntity>(params: IKafkaProducerParams<IEntity>): Promise<RecordMetadata[]>
}