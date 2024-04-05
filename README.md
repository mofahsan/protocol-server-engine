# ONDC Protocol Server

The ONDC Protocol Server facilitates the conversion of Beckn payloads to business payloads and vice versa. It can also verify the schema of various ONDC requests across different flows and configurations.

By leveraging the Protocol Server, network participants can seamlessly interact with the ONDC network. It ensures that the data exchanged between buyers and sellers adheres to the specified schema, promoting interoperability and consistency.

## Key Features

The Protocol Server offers a range of functionalities to enhance the overall ONDC experience:

- **Buisness Payload**: Convert any beckn payload to a more compact buisness payload and vice versa for your application.
- **Request Routing**: Efficiently routes incoming requests to the appropriate endpoints based on the specified ONDC flow and configuration.
- **Error Handling**: Handles protcol errors(NACKs) gracefully, providing meaningful error messages and responses.
- **Logging and Monitoring**: Offers comprehensive logging and monitoring capabilities, allowing network participants to track and analyze the flow of data and identify potential bottlenecks or anomalies.
- **Security and Authentication**: Implements robust security measures, including authentication and authorization mechanisms, to ensure the integrity and confidentiality of the exchanged data.
- **Extensibility**: Designed to be extensible, allowing for the integration of additional functionalities or customizations as per the specific requirements of network participants.

By harnessing the capabilities of the Protocol Server, participants of the ONDC network can optimize their integration processes, uphold data integrity, and augment the overall efficiency and dependability of their interactions within the network.

## Prerequisites

Before running the Protocol Server, make sure you have the following prerequisites installed:

- **Node.js**: You can download it from the official website: [Node.js](https://nodejs.org)
- **Git**: Install Git to clone the necessary repositories. [Git](https://git-scm.com)
- **ONDC Network Credentials**:
  - Obtain the necessary credentials to communicate with the ONDC network, including:
    - PRIVATE_KEY & PUBLIC_KEY
    - BAP ID or BPP ID
    - UNIQUE_KEY

## Environment File Setup

To set up the `.env` file for the Protocol Server, follow these steps:

1. **Create a New File**: In the root directory of the Protocol Server project, create a new file named `.env`.

2. **Add Configuration Variables**: Copy and paste the following configuration variables into the `.env` file. Be sure to replace `<----YOUR_KEY------>`, `<----YOUR_BAP_ID------>`, and `<----YOUR_UNIQUE_KEY------>` with your actual values.

   ### Protocol Server Configuration

   ```plaintext
   config_url=https://api.github.com/repos/mofahsan/protocol_config/contents/build/build.js?ref=
   branchName=mockserver/metro
   VERIFY_AUTH=false
   PORT=3000
   SYNC=false
   SERVER_TYPE=BPP
   CALLBACK_URL=http://localhost:3000
   BACKEND_SERVER_URL=http://localhost:5500
   PRIVATE_KEY=<----YOUR_KEY------>
   BAPID=<----YOUR_BAP_ID------>
   UNIQUE_KEY=<----YOUR_UNIQUE_KEY------>
   ```

## Installation for Buyer applications

To install the Protocol Server for the buyer application, follow these steps:

## Installation for Seller Application

To install the Protocol Server for the Seller application, follow these steps:

<!-- 1. Clone the [Seller Mock Server](https://github.com/your-seller-mock-server-repo) repository. -->
<!-- 2. Follow the instructions provided in the repository to set up and configure the Seller Mock Server. -->

## Contributing

We welcome contributions from the community. If you would like to contribute to the development of the ONDC Protocol Server, please follow our [contribution guidelines](CONTRIBUTING.md).

## License

The ONDC Protocol Server is released under the [MIT License](LICENSE).
