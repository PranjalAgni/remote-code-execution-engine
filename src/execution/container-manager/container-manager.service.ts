import { Injectable, Logger } from "@nestjs/common";
import * as Docker from "dockerode";
import { generateShortUUID } from "../../utils/id";
import * as path from "path";
import { createDir, createFile } from "src/utils/io";

@Injectable()
export class ContainerManagerService {
    private docker: Docker;
    private readonly logger = new Logger(ContainerManagerService.name);

    constructor() {
        this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
    }

    async runContainer(image: string, cmd: string[], code: string, extension: string): Promise<string> {
        const id = generateShortUUID();
        const codeDirPath = path.join(process.cwd(), "codes", id);
        this.logger.log(`Creating code directory: ${codeDirPath}`);
        await createDir(codeDirPath);
        const filePath = path.join(codeDirPath, `code.${extension}`);
        this.logger.log(`Creating file: ${filePath}`);
        await createFile(`code.${extension}`, codeDirPath, code);
        
        try {
            const container = await this.docker.createContainer({
                Image: image,
                Cmd: ["gcc -o a.out ./code.cpp"],
                HostConfig: {
                    AutoRemove: true,
                    Memory: 30 * 1024 * 1024, // 30MB memory limit
                    Binds: [
                        `${filePath}:/usr/src/app/code.${extension}`,
                    ],
                    // Additional security options can be added here
                },
                WorkingDir: "/usr/src/app",
            });

            await container.start();
            const stream = await container.logs({
                follow: true,
                stdout: true,
                stderr: true,
            });

            let output = "";
            stream.on("data", (chunk: Buffer) => {
                output += chunk.toString();
            });

            await container.wait();
            return output;
        } catch (error) {
            this.logger.error("Error running container", error);
            throw error;
        }
    }
}
