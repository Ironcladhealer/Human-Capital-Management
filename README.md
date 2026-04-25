# Technical Requirement Document: Time-Off Microservice

## 1. Executive Summary & Product Context
ExampleHR requires a backend microservice to manage employee time-off requests. While ExampleHR serves as the primary user interface for employees, the external Human Capital Management (HCM) system remains the absolute "Source of Truth" for all employment data and balances. The core objective of this microservice is to maintain balance integrity between ExampleHR and the HCM, ensuring employees see accurate balances and managers can approve valid requests. 

## 2. Suggested Solution & Architecture
The system is built as a standalone microservice using **NestJS**, **GraphQL**, and a local **SQLite** database via TypeORM. 

The architecture employs a **"Write-Through Cache with Lazy Loading"** strategy:
* **Lazy Loading (Reads):** When a user's balance is queried, the system checks the local SQLite database. If a record does not exist, it fetches the real-time balance from the HCM API and caches it locally.
* **Write-Through (Mutations):** When a user requests time off, the system first validates the request against the local database. If valid, it immediately forwards the deduction to the HCM API. Only upon a successful response from the HCM does the local SQLite balance update, ensuring the systems remain in sync.
* **Batch Synchronization:** To handle independent balance changes in the HCM (e.g., yearly refreshes or work anniversaries), the service can consume the HCM's batch endpoint to periodically overwrite local caches with the latest multidimensional data.

## 3. Key Challenges Addressed
Based on the system constraints, this architecture specifically mitigates two major challenges:

### A. The Dual Source Problem (Out-of-Band Updates)
Keeping balances synced is notoriously difficult because the HCM can update balances independently without notifying ExampleHR. 
* **Mitigation:** The local SQLite database is treated strictly as a high-performance cache, not the source of truth. By implementing a sync strategy using the HCM batch endpoint, the system can periodically reconcile local data with the HCM.

### B. Unreliable HCM Error Handling
The HCM may not reliably return errors if a time-off request is filed against an invalid dimension (e.g., wrong location) or an insufficient balance.
* **Mitigation:** The microservice acts defensively. All requests are first strictly validated against the local SQLite state. If an employee requests 5 days but only has 2 locally, the microservice immediately rejects the request with a `BadRequestException` and completely bypasses the call to the HCM. This protects the source of truth from bad data and saves network overhead.

## 4. Analysis of Alternatives Considered
During the design phase, several alternative approaches were evaluated:

* **Alternative 1: 100% Passthrough (No Local Database)**
    * *Concept:* Every GraphQL query and mutation directly pings the HCM without storing any data in ExampleHR.
    * *Pros:* Guarantees the data is always 100% accurate; eliminates the dual-source sync problem.
    * *Cons:* Extremely high latency for the user. It also breaks the defensive programming requirement; if we don't hold local state, we cannot pre-validate requests, leaving the system vulnerable to the HCM's unreliable error handling. 

* **Alternative 2: Polling the Realtime API**
    * *Concept:* Continuously pinging the real-time HCM API for every employee to catch work anniversaries.
    * *Pros:* Keeps data relatively fresh without waiting for a batch job.
    * *Cons:* Massive, unnecessary network traffic. Rate-limiting from the HCM would likely cause cascading failures across the microservice. 

* **Alternative 3: Event-Driven Architecture (Kafka/RabbitMQ)**
    * *Concept:* The HCM pushes events to a message broker whenever a balance changes, and our microservice consumes them.
    * *Pros:* The industry gold standard for syncing distributed systems. Real-time accuracy without polling.
    * *Cons:* The requirements explicitly state the HCM provides REST endpoints (Realtime API and Batch), not webhooks or an event stream. We cannot assume the HCM supports event publishing.

## 5. Testing & Quality Assurance
The value of this implementation relies heavily on test rigor.
* **Mock Infrastructure:** A dedicated `HcmMockService` simulates the external HCM system, including programmable failures to test defensive logic.
* **Integration Testing:** Jest is utilized to ensure the GraphQL resolvers correctly orchestrate the local database updates and the mock HCM API calls, guarding against future regressions. CI/CD pipelines enforce these checks on every commit.