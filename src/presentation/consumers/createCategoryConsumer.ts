import { inject, injectable } from "tsyringe";
import { IConsumer, IConsumerProps, IConsumerMessage } from "@presentation/types/IConsumer";
import { tokens } from "@di/tokens";
import { ICategoryService } from "@domain/category/types/ICategoryService";
import { ICategory } from "@domain/category/types/ICategory";

@injectable()
export default class CreateCategoryConsumer implements IConsumer {

    private name = "async-create-category";
    private topic = "Queuing.Example.Category";
    private timeout = 180;

    constructor(
        @inject(tokens.CategoryService)
        private categoryService: ICategoryService
    ) { }

    async execute(msg: IConsumerMessage): Promise<void> {
        const data = msg.message.value as ICategory;
        return this.categoryService.create(data, {requestId: msg.identify});
    }

    get props(): IConsumerProps {
        return {
            execute: (msg) => this.execute(msg),
            name: this.name,
            topic: this.topic,
            timeout: this.timeout,
        };
    }

}