This is a simple Node.js application demonstrating a race condition scenario using Redis for managing a shared counter and RabbitMQ for inter-process communication.

The purpose of this application is to illustrate how race conditions can occur when multiple processes or threads attempt to update a shared resource concurrently, leading to unexpected results such as incorrect counter values.

To run this application, you'll need:

- Node.js installed on your machine
- Redis server running locally
- RabbitMQ server running locally

## Installation

1. Clone this repository:

```bash
git clone <repository_url>
cd race-condition-demo

