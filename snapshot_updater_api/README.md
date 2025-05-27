# Snapshot Updater API

This API provides an endpoint to update the `snapshot` URL in the main `config.json` file of the repository.

## Purpose

The primary goal of this API is to allow dynamic updates to a snapshot URL that is used by the main application.

## Setup and Running

1.  **Navigate to the API directory:**
    ```bash
    cd snapshot_updater_api
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm installed. Then, run:
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```
    By default, the server will start on port 3000. You should see a message like: `Server running on port 3000`.

## API Endpoint

### Update Snapshot URL

*   **Method:** `POST`
*   **Endpoint:** `/update_snapshot`
*   **Request Body:** JSON
    ```json
    {
      "snapshot_url": "your_new_snapshot_url_here"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Snapshot URL updated successfully."
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If `snapshot_url` is missing in the request.
    *   `500 Internal Server Error`: If there's an issue reading or writing `config.json`, or other server-side errors.

## Interaction with `config.json`

This API reads and writes to the `config.json` file located at the root of the repository (i.e., `../config.json` relative to this API's `server.js`).

## Dockerization (Considerations)

If you wish to run this API service as a Docker container, you can create a `Dockerfile` in the `snapshot_updater_api` directory.

**Example `Dockerfile` for this Node.js service:**

```dockerfile
# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable (optional, if you want to configure port)
ENV PORT=3000

# Run server.js when the container launches
CMD [ "node", "server.js" ]
```

**Building the Docker image:**

Navigate to the `snapshot_updater_api` directory and run:
```bash
docker build -t snapshot-updater-api .
```

**Running the Docker container:**

```bash
docker run -p 3000:3000 -v /path/to/your/repo/config.json:/usr/src/app/config.json snapshot-updater-api
```
**Important:**
*   You need to mount the main `config.json` file into the container so the API can access it. Adjust the volume mount path (`/path/to/your/repo/config.json`) accordingly.
*   If this service needs to run alongside the main `gaianet` application (which is likely managed by its own Docker setup, possibly via Docker Compose), you would need to integrate this new service into that existing setup. This might involve adding it as another service in a `docker-compose.yml` file.
*   Ensure the port `3000` (or whichever port you configure) does not conflict with other services.
