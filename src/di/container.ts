import { container } from "tsyringe";
import { tokens } from "./tokens";
import { Config } from "@config/config";
import CategoryService from "@domain/category/services/categoryService";
import CategoryRepository from "@domain/category/infrastructure/categoryRepository";
import ApmClient from "@infrastructure/apm/apm";
import ProductRepository from "@domain/product/infrastructure/productRepository";
import ProductService from "@domain/product/services/productService";
import CreateCategoryConsumer from "@presentation/consumers/createCategoryConsumer";
import CreateProductConsumer from "@presentation/consumers/createProductConsumer";
import SystemService from "@domain/system/services/systemService";
import SystemRepository from "@domain/system/infrastructure/systemRepository";
import HealthcheckConsumer from "@presentation/consumers/healthcheckConsumer";
import KafkaProducer from "@infrastructure/kafka/producer";

const childContainer = container.createChildContainer();

childContainer.registerSingleton(tokens.Config, Config);
childContainer.registerSingleton(tokens.ApmClient, ApmClient);
childContainer.registerSingleton(tokens.KafkaProducer, KafkaProducer);
childContainer.registerSingleton(tokens.CategoryService, CategoryService);
childContainer.registerSingleton(tokens.CategoryRepository, CategoryRepository);
childContainer.registerSingleton(tokens.ProductService, ProductService);
childContainer.registerSingleton(tokens.ProductRepository, ProductRepository);
childContainer.registerSingleton(tokens.SystemService, SystemService);
childContainer.registerSingleton(tokens.SystemRepository, SystemRepository);
childContainer.registerSingleton(tokens.Consumer, CreateProductConsumer);
childContainer.registerSingleton(tokens.Consumer, CreateCategoryConsumer);
childContainer.registerSingleton(tokens.Consumer, HealthcheckConsumer);

export { childContainer as container };