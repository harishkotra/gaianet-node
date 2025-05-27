const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/update_snapshot', (req, res) => {
    const { snapshot_url } = req.body;

    if (!snapshot_url) {
        return res.status(400).json({ message: 'snapshot_url is required' });
    }

    try {
        const parsedUrl = new URL(snapshot_url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        protocol.get(snapshot_url, { headers: { 'User-Agent': 'SnapshotVerifier/1.0' } }, (checkRes) => {
            const { statusCode } = checkRes;
            if (statusCode >= 200 && statusCode < 300) {
                checkRes.resume(); // Consume response data

                // URL is valid, proceed with update logic
                const configPath = process.env.GAIANET_CONFIG_PATH || path.join(__dirname, '../config.json');

                fs.readFile(configPath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading config.json:', err);
                        return res.status(500).json({ message: 'Error reading configuration file.' });
                    }

                    let config;
                    try {
                        config = JSON.parse(data);
                    } catch (parseErr) {
                        console.error('Error parsing config.json:', parseErr);
                        return res.status(500).json({ message: 'Error parsing configuration file.' });
                    }

                    config.snapshot = snapshot_url;

                    fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8', (writeErr) => {
                        if (writeErr) {
                            console.error('Error writing config.json:', writeErr);
                            return res.status(500).json({ message: 'Error writing configuration file.' });
                        }

                        exec('/root/gaianet/bin/gaianet init', (initError, stdout, stderr) => {
                            if (initError) {
                                console.error(`Error executing gaianet init: ${initError.message}`);
                                return res.status(500).json({
                                    message: 'Snapshot URL updated, but gaianet init failed.',
                                    error: initError.message,
                                    stdout: stdout,
                                    stderr: stderr
                                });
                            }
                            if (stderr) {
                                console.warn(`gaianet init stderr: ${stderr}`);
                            }
                            console.log(`gaianet init stdout: ${stdout}`);
                            return res.status(200).json({ message: 'Snapshot URL updated and gaianet init triggered successfully.' });
                        });
                    });
                });
            } else {
                checkRes.resume(); // Consume response data to free up memory
                return res.status(400).json({ message: `Snapshot URL verification failed with status code: ${statusCode}` });
            }
        }).on('error', (e) => {
            console.error(`Error verifying snapshot URL: ${e.message}`);
            return res.status(400).json({ message: 'Snapshot URL verification failed.', error: e.message });
        });
    } catch (e) {
        console.error(`Invalid URL provided: ${e.message}`);
        return res.status(400).json({ message: 'Invalid snapshot URL format.', error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
