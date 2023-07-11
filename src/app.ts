import { inject, injectAll, singleton } from "tsyringe";
import { Command } from "commander";
import { table } from "table";
import { IConsumer } from "@presentation/types/IConsumer";
import { tokens } from "@di/tokens";
import { v4 } from "uuid";
import { Kafka, EachMessagePayload, Consumer, logLevel } from "kafkajs";
import { Config } from "@config/config";
import { IApmAdapter } from "@infrastructure/types/IApmAdapter";
import { Logger } from "@infrastructure/logger/logger";
import Common from "@helpers/Common";
import { IKafkaProducer } from "@infrastructure/types/IkafkaProducer";
import R from "ramda";

@singleton()
export default class App {

    private program: Command;
    private kafka: Kafka;

    constructor(
        @inject(tokens.ApmClient)
        private apmClient: IApmAdapter,

        @inject(tokens.KafkaProducer)
        private producer: IKafkaProducer,

        @inject(tokens.Config)
        private config: Config,

        @injectAll(tokens.Consumer)
        private commands: IConsumer[]
    ){
        this.program = new Command();
        this.kafka = new Kafka({
            logLevel: logLevel.ERROR,
            brokers: this.config.get().kafka.brokers,
            clientId: this.config.get().serviceName,
            connectionTimeout: this.config.get().kafka.connectionTimeout
        });
        this.listAction();
    }

    private log(msg: unknown) {
        // eslint-disable-next-line no-console
        console.info(msg);
    }

    private listAction(){
        this.program
            .command("list")
            .description("Consumer´s list")
            .action(()=>{
                const data = [["Index", "Name", "Topic"]];
                for (let index = 0; index < this.commands.length; index += 1) {
                    const props = this.commands[index].props;
                    data.push([
                      index.toString(),
                      props.name,
                      props.topic,
                    ]);
                }
                
                this.log(`\n${table(data)}`);  
                process.exit(0);
            });  
        this.commands.forEach((execute)=>{
            const command = execute.props;        
            this.program
                .command(command.name)
                .description(`execute ${command.name}`);
        }); 
    }

    private async executeTask(execute: IConsumer, {message, partition, topic}: EachMessagePayload, callbackError = true){
        const command = execute.props;
        const apmTransacion = this.apmClient.Agent?.startTransaction(command.name);
        let apmTransacionResult = "sucess";
        let errorExec: Error | null = null;

        try {
            const value = Common.jsonDeserializer(message.value) as object;
            if (Object.keys(value).length === 0) {
                Logger.info(`Consumer topic ${topic} msg is not valid data`);
                return;
            }
            Logger.info(`Consumer topic ${topic} msg ${JSON.stringify(value)}`);
            await command.execute({
                identify: value["identifier"] || v4(),
                partition,
                message: {
                    ...message,
                    value,
                }
            });
        } catch (err) {
            Logger.error(`Failed Consumer topic ${topic} error ${JSON.stringify(err)}`);
            apmTransacionResult = "error";
            this.apmClient.captureError(err);
            errorExec = err as Error;
        }
        if(apmTransacion){
            apmTransacion.result = apmTransacionResult;
            apmTransacion?.end();
        }
        if(errorExec != null && callbackError){
            throw errorExec;
        }
    }

    private async consumerAsync(
        consumer: Consumer,
        msg: EachMessagePayload
    ){
        const {topic, partition, message, heartbeat} = msg;
        const [ command ] = this.commands.filter((c => c.props.topic === topic));
        const maxNumAttempts = command.props.retryCount || 5;
        const retryEnable = command.props.retryEnable || true;
        const errors: Error[] = [];
        let currentNumAttempts = 0;
        let committed = false;
        while(currentNumAttempts < maxNumAttempts){
            currentNumAttempts++;
            try {
                Logger.info(`Consumer topic ${topic} partition: ${partition} offset: ${message.offset} timestamp: ${message.timestamp}`);
                await this.executeTask(command, msg, true);
                committed = await this.commitOffsets(consumer, msg);
                if (committed) break;
            } catch (err) {
                await heartbeat(); // Prevent: The coordinator is not aware of this member
                errors.push(err as Error);
                const status = R.path(
                    ["response", "status"],
                    (err as object),
                );
                if(!retryEnable) break;
                if(Number(status) === 400) break;
                const isRetry = await this.retryConsumer(currentNumAttempts, maxNumAttempts, msg);
                if (!isRetry) break;
            }
        }
        if (!committed) // Publish in deadleare queue
        {
            await Promise.allSettled([
                this.commitOffsets(consumer, msg),
                this.publishDeadQueueAsync(msg, errors)
            ]);
        }
    }

    private async publishDeadQueueAsync(msg: EachMessagePayload, exeptions: Error[]){
        const message = Common.jsonDeserializer(msg.message.value) as object;
        const [ queue ] = await this.producer.execute({
            topic: `${msg.topic}.DeadLetterQueue`,
            data: {
                ...message,
                exeptions
            }
        });
        Logger.info(`Publish ${queue.topicName} partition: ${queue.partition} offset: ${queue.offset}`);
    }
    
    private async retryConsumer(
        currentNumAttempts: number, 
        maxNumAttempts: number, 
        {topic, partition, message: { offset }}: EachMessagePayload
    ): Promise<boolean> {
        if(currentNumAttempts < maxNumAttempts){
            // Delay between tries
            Logger.info(`Retry Count: ${currentNumAttempts} topic: ${topic} partition: ${partition} offset: ${offset}`);
            await Common.delay(5000);
            return true;
        }

        return false;
    }

    private async commitOffsets(consumer: Consumer, {topic, message: {offset}, partition}: EachMessagePayload): Promise<boolean> {
        try {
            await consumer.commitOffsets([{
                topic,
                partition,
                offset
            }]);
            return true;
        } catch (error) {
            Logger.error(`Failed to commit topic ${topic} partition: ${partition} offset: ${offset}`, error);
            return false;            
        }
    }

    private startConsumer(commandName: string){
        setImmediate(async()=>{
            const groupId = this.config.get().serviceName;
            const consumer = this.kafka.consumer({
                groupId,
                allowAutoTopicCreation: true,
            });
            await consumer.connect();
            this.commands.forEach(async(job)=>{
                const command = job.props;
                if((command.name === commandName || commandName.length === 0 ) && command.topic.length > 0 ){
                    try {
                        await consumer.subscribe({topic: command.topic, fromBeginning: true});
                        Logger.info(`Consumer ${command.topic} Starting groupId: ${groupId}`);
                    } catch (error) {
                        Logger.error(`Failed to start consumer ${command.topic}`, error);
                    }
                }
            });
            await consumer.run({
                autoCommit: false,
                partitionsConsumedConcurrently: this.config.get().kafka.concurrently,
                eachMessage: async (msg) => await this.consumerAsync(consumer, msg)
            });
        });
    }

    start(){
        this.program
            .command("all")
            .description("execute all consumer´s async");

        this.program
            .command("*")
            .action(() => {
                this.log("comando não encontrado");  
                process.exit(0);
            });

        const argv = process.argv;
        const commands = this.commands.filter((c => argv.includes(c.props.name)));
        this.program.parse(argv);
        if (commands.length > 0) {
            this.startConsumer(commands[0].props.name);
        } else if(argv.includes("all")){
            this.startConsumer("");
        }
    }
}