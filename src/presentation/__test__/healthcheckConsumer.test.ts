import { container } from "@di/container";
import nock from "nock";
import { Config } from "@config/config";
import HealthcheckConsumer from "@presentation/consumers/healthcheckConsumer";
import { IConsumerMessage } from "@presentation/types/IConsumer";

const url = new Config().get().backend.core;
const requestMock = nock(url).get("/v1/system/healthcheck");

describe("HealthcheckConsumer", ()=>{
    const command = container.resolve(HealthcheckConsumer);

    beforeEach(()=>{
        jest.clearAllMocks();
    });

    it("should return with success", async () => {
        const message = {
            identify: "any",
            partition: 0,
            message: {}
        } as IConsumerMessage;
        requestMock.reply(200);
        await expect(command.execute(message)).resolves.not.toThrow();
    });

    it("should return with failed", async () => {
        const message = {
            identify: "any",
            partition: 0,
            message: {}
        } as IConsumerMessage;
        requestMock.reply(500);
        await expect(command.execute(message)).rejects.toThrow("Request failed with status code 500");
    });
});