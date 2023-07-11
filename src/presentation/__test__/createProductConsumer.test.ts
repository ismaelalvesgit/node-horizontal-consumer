import { container } from "@di/container";
import nock from "nock";
import { Config } from "@config/config";
import CreateProductConsumer from "@presentation/consumers/createProductConsumer";
import { IConsumerMessage } from "@presentation/types/IConsumer";

const url = new Config().get().backend.core;
const requestMock = nock(url);

describe("CreateProductConsumer", ()=>{
    const command = container.resolve(CreateProductConsumer);

    beforeEach(()=>{
        jest.clearAllMocks();
    });

    it("should return with success", async () => {
        const message = {
            identify: "any",
            partition: 0,
            message: {
                value: {}
            }
        } as IConsumerMessage;
        requestMock.get("/v1/category").reply(200, {
            items: [{id: "any"}]
        });
        requestMock.post("/v1/product").reply(200);
        await expect(command.execute(message)).resolves.not.toThrow();
    });

    it("should return with failed", async () => {
        const message = {
            identify: "any",
            partition: 0,
            message: {
                value: {}
            }
        } as IConsumerMessage;
        requestMock.get("/v1/category").reply(200, {
            items: [{id: "any"}]
        });
        requestMock.post("/v1/product").reply(500);
        await expect(command.execute(message)).rejects.toThrow("Request failed with status code 500");
    });
});