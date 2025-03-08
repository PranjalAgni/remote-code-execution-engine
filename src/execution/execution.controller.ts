import { Controller, Post, Body, Logger } from "@nestjs/common";
import { ContainerManagerService } from "./container-manager/container-manager.service";

@Controller("execute")
export class ExecutionController {
    private readonly logger = new Logger(ExecutionController.name);
    constructor(private readonly containerService: ContainerManagerService) { }

    @Post()
    async executeCode(
        @Body() body: { language: string; code: string },
    ): Promise<any> {
        const imageMap = {
            javascript: "node:14",
            python: "python:3.10",
            c: "gcc:latest",
            cpp: "gcc:latest",
            java: "openjdk:latest",
            golang: "golang:latest",
        };

        const commandMap = {
            javascript: ["node", "code.js"],
            python: ["python", "code.py"],
            c: ["gcc", "-o", "a.out", "code.c", "&&", "./a.out"],
            cpp: ["g++", "-o", "a.out", "code.cpp", "&&", "./a.out"],
            java: ["javac", "code.java", "&&", "java", "code"],
            golang: ["go", "run", "code.go"],
        };

        const extensionMap = {
            javascript: "js",
            python: "py",
            c: "c",
            cpp: "cpp",
            java: "java",
        };

        const image = imageMap[body.language.toLowerCase()];
        if (!image) {
            return { error: "Unsupported language" };
        }

        const cmd = commandMap[body.language.toLowerCase()];

        this.logger.log(`Running command: ${cmd.join(" ")}`);

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
