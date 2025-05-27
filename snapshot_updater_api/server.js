const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/update_snapshot', (req, res) => {
    const { snapshot_url } = req.body;

    if (!snapshot_url) {
        return res.status(400).json({ message: 'snapshot_url is required' });
    }

    const configPath = path.join(__dirname, '../config.json');

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

            res.status(200).json({ message: 'Snapshot URL updated successfully.' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
