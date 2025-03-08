import { Injectable, Logger } from "@nestjs/common";
import * as Docker from "dockerode";
import { generateShortUUID } from "../../utils/id";
import * as path from "path";
import * as tar from "tar-fs";
import * as stream from "stream";
import { createDir, createFile, deleteDir } from "src/utils/io";
import { promisify } from "util";

@Injectable()
export class ContainerManagerService {
    private docker: Docker;
    private readonly logger = new Logger(ContainerManagerService.name);
    constructor() {
        this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
    }

    // Helper to collect stream data into a string.
    private streamToString(
        readableStream: NodeJS.ReadableStream,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            let data = "";
            readableStream.on("data", (chunk) => {
                data += chunk.toString();
            });
            readableStream.on("error", (err) => reject(err));
            readableStream.on("end", () => resolve(data));
        });
    }

    async runContainer(
        image: string,
        cmd: string[],
        code: string,
        extension: string,
    ): Promise<string> {
        const id = generateShortUUID();
        const codeDirPath = path.join(process.cwd(), "codes", id);
        this.logger.log(`Creating code directory: ${codeDirPath}`);
        await createDir(codeDirPath);
        const filePath = path.join(codeDirPath, `code.${extension}`);
        this.logger.log(`Creating file: ${filePath}`);
        await createFile(`code.${extension}`, codeDirPath, code);

        try {
            const container = await this.docker.createContainer({
                Image: "gcc:latest",
                Cmd: [
                    "bash",
                    "-c",
                    "cd /usr/src/app && g++ -o code.out code.cpp && ./code.out",
                ],
                Tty: false,
                WorkingDir: "/usr/src/app",
                HostConfig: {
                    Memory: 30 * 1024 * 1024, // 30MB memory limit
                    Binds: [`${filePath}:/usr/src/app/code.${extension}`],
                }
            });

            await container.start();
            this.logger.verbose(`Container started and Copied the local "codes" directory into /usr/src/app inside the container.`);

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
        } finally {
            await deleteDir(codeDirPath)
        }
    }

    async runContainerSlow(
        image: string,
        cmd: string[],
        code: string,
        extension: string,
    ): Promise<string> {
        const id = generateShortUUID();
        const codeDirPath = path.join(process.cwd(), "codes", id);
        this.logger.log(`Creating code directory: ${codeDirPath}`);
        await createDir(codeDirPath);
        const filePath = path.join(codeDirPath, `code.${extension}`);
        this.logger.log(`Creating file: ${filePath}`);
        await createFile(`code.${extension}`, codeDirPath, code);

        try {
            const finished = promisify(stream.finished);
            // 1. Create a container with gcc:latest
            const container = await this.docker.createContainer({
                Image: "gcc:latest",
                Cmd: ["tail", "-f", "/dev/null"], // Keeps the container running.
                Tty: false,
                WorkingDir: "/usr/src/app",
                HostConfig: {
                    Memory: 30 * 1024 * 1024, // 30MB memory limit
                    Binds: [`${filePath}:/usr/src/app/code.${extension}`],
                }
            });

            await container.start();
            this.logger.verbose(`Container started and Copied the local "codes" directory into /usr/src/app inside the container.`);
            
            // 2. Compile the C++ code inside the container.
            // Here we assume that the main file is "main.cpp" and we produce an executable "myapp".

            const compileExec = await container.exec({
                Cmd: [
                    "bash",
                    "-c",
                    "cd /usr/src/app && g++ -o code.out code.cpp",
                ],
                AttachStdout: true,
                AttachStderr: true,
            });

            const compileStream = await compileExec.start({ hijack: true, stdin: false });
            await finished(compileStream);
            this.logger.log("Compilation finished.");

            // 3. Run the compiled executable.
            const runExec = await container.exec({
                Cmd: ["bash", "-c", "cd /usr/src/app && ./code.out"],
                AttachStdout: true,
                AttachStderr: true,
            });

            const runStream = await runExec.start({ hijack: true, stdin: false });
            const output = await this.streamToString(runStream);
            await finished(runStream);
            this.logger.log("Execution finished");

            // Cleanup: stop and remove the container.
            await container.stop();
            await container.remove();
            console.log("Container cleaned up.");

            return output;

        } catch (error) {
            this.logger.error("Error running container", error);
            throw error;
        } finally {
            await deleteDir(codeDirPath)
        }
    }

   
}
