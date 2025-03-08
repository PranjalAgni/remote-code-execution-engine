# Remote Code execution

### Supported Languages & Containers

-   **Languages:** C, C++, Java, JavaScript, Golang.
-   **Container Strategy:** One dedicated ephemeral container per language.

### Container Lifecycle

-   **Ephemeral Containers:** Containers will be spun up for each code execution and then discarded afterward.

### Execution Model & API

-   **Synchronous Execution:** Initially, code execution will be synchronous.
-   **Endpoints:** We'll have endpoints to check the system's health and submit code.

### Resource Constraints & Security

-   **Limits:** Each execution will have a 5-second time limit and a 30 MB memory cap.
-   **Sandboxing:** We'll rely on Docker’s built-in security features (e.g., user namespace remapping, seccomp profiles, AppArmor/SELinux) for the sandbox environment.
-   **Future Enhancements:** More advanced security measures and handling for malicious code will be explored in version 2.

### Output & Logging

-   **Output:** The entire stdout output will be sent back to the user.
-   **Logging:** We'll implement logging to trace the lifecycle of each container and execution.

### Scaling & Performance

-   **Autoscaling:** While the system will handle synchronous requests for now, we plan to implement autoscaling in the future.
-   **Request Handling:** Even though the event loop can handle queuing synchronously for now, we might consider a centralized job queue as the system evolves.

### Deployment & Networking

-   **Deployment & Communication:** Details such as the deployment environment and networking between Node and Docker will be addressed in later versions (v2).


### Current Architecture


