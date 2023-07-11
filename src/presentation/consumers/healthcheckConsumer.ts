import { inject, injectable } from "tsyringe";
import { IConsumerProps, IConsumer, IConsumerMessage } from "@presentation/types/IConsumer";
import { tokens } from "@di/tokens";
import { ISystemService } from "@domain/system/types/ISystemService";

@injectable()
export default class HealthcheckCommand implements IConsumer {

    private name = "healthcheck";
    private topic = "";
    private timeout = 180;

    constructor(
        @inject(tokens.SystemService)
        private systemService: ISystemService
    ) { }

    async execute(_: IConsumerMessage): Promise<void> {
        return this.systemService.healthcheck();
    }
    
    get props(): IConsumerProps {
        return {
            execute: (identify) => this.execute(identify),
            name: this.name,
            topic: this.topic,
            timeout: this.timeout,
        };
    }

}