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
        // Map the language to the appropriate Docker image and command.
        // This is a simplified example. In a full implementation, you'll need to
        // write the code to a file, mount it in the container, etc.
        const imageMap = {
            javascript: "node:14",
            python: "python:3.10",
            c: "gcc:latest",
            cpp: "gcc:latest",
            java: "openjdk:latest",
            golang: "golang:latest",
            // Add mappings for C, C++, Java, Golang, etc.
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

        // we can just run the program
        // <language_compiler code.<language>
        
        const cmd = commandMap[body.language.toLowerCase()];

        this.logger.log(`Running command: ${cmd.join(" ")}`);

        try {
            const output = await this.containerService.runContainer(image, cmd, body.code, extensionMap[body.language.toLowerCase()]);
            return { output };
        } catch (error) {
            return { error: error.message };
        }
    }
}
