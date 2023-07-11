import { inject, injectable } from "tsyringe";
import { IConsumerMessage, IConsumer, IConsumerProps } from "@presentation/types/IConsumer";
import { tokens } from "@di/tokens";
import { IProductService } from "@domain/product/types/IProductService";
import { IProduct } from "@domain/product/types/IProduct";

@injectable()
export default class CreateProductConsumer implements IConsumer {

    private name = "async-create-product";
    private topic = "Queuing.Example.Product";
    private timeout = 180;

    constructor(
        @inject(tokens.ProductService)
        private productService: IProductService
    ) { }

    async execute(msg: IConsumerMessage): Promise<void> {
        const data = msg.message.value as IProduct;
        return this.productService.create(data, {requestId: msg.identify});
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