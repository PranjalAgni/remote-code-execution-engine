import { Controller, Post, Body, Logger } from "@nestjs/common";
import { ContainerManagerService } from "./container-manager/container-manager.service";
import { imageMap } from "src/config/image-map";
import { commandMap } from "src/config/command-map";
import { extensionMap } from "src/config/extension-map";

@Controller("execute")
export class ExecutionController {
    private readonly logger = new Logger(ExecutionController.name);
    constructor(private readonly containerService: ContainerManagerService) { }

    @Post()
    async executeCode(
        @Body() body: { language: string; code: string },
    ): Promise<any> {
        const image = imageMap[body.language.toLowerCase()];
        if (!image) {
            return { error: "Unsupported language" };
        }
        
        const cmd = commandMap[body.language.toLowerCase()];

        this.logger.log(`Running command: ${cmd}`);

        try {
            const startTime = Date.now();
            const output = await this.containerService.runContainer(image, cmd, body.code, extensionMap[body.language.toLowerCase()]);
            const endTime = Date.now();
            const executionTime = (endTime - startTime) / 1000; // Convert milliseconds to seconds
            return { output, executionTime };
        } catch (error) {
            return { error: error.message };
        }
    }
}
