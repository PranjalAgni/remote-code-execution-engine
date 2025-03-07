import { Injectable, Logger } from "@nestjs/common";
import * as Docker from "dockerode";

@Injectable()
export class ContainerManagerService {
    private docker: Docker;
    private readonly logger = new Logger(ContainerManagerService.name);

    constructor() {
        this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
    }

    async runContainer(image: string, cmd: string[]): Promise<string> {
        try {
            const container = await this.docker.createContainer({
                Image: image,
                Cmd: cmd,
                HostConfig: {
                    AutoRemove: true,
                    Memory: 30 * 1024 * 1024, // 30MB memory limit
                    // Additional security options can be added here
                },
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
