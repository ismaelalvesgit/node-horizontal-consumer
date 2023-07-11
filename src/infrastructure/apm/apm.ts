import { tokens } from "@di/tokens";
import { IApmAdapter } from "@infrastructure/types/IApmAdapter";
import { inject, injectable } from "tsyringe";
import apm, { Agent } from "elastic-apm-node";
import { Config } from "@config/config";
import { EEnvironmentType } from "@config/types/IConfig";

@injectable()
export default class ApmClient implements IApmAdapter {
    
    protected elasticAgent?: Agent;

    constructor(
        @inject(tokens.Config)
        private config: Config
    ) {
        const { apm: {
            secretToken,
            serverUrl,
            apiKey,
            cloudProvider
        }, serviceName, environment } = this.config.get();
        this.elasticAgent = serverUrl.length > 0 && environment !== EEnvironmentType.Test ?
        apm.start({
            serviceName,
            secretToken,
            apiKey,
            serverUrl,
            cloudProvider,
            environment
        }) : undefined;
    }

    captureError(err: string | Error | apm.ParameterizedMessageObject, callback?: apm.CaptureErrorCallback | undefined): void {
        if (this.elasticAgent?.isStarted()) {
            this.elasticAgent.captureError(err, callback);
        }
    }

    get Agent(): Agent | undefined {
        return this.elasticAgent;
    }
}