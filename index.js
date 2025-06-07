const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

const M3U8_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const BASE_URL = 'https://test-streams.mux.dev/x36xhzz/';

app.get('/live.m3u8', async (req, res) => {
  try {
    const m3u8 = await axios.get(M3U8_URL);
    const playlist = m3u8.data.replace(/(fileSequence\d+\.ts)/g, '/segment/$1');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('#EXTM3U\n# ERROR: Unable to fetch M3U8\n');
  }
});

app.get('/segment/:filename', async (req, res) => {
  try {
    const tsURL = BASE_URL + req.params.filename;
    const ts = await axios({ url: tsURL, responseType: 'stream' });
    res.setHeader('Content-Type', 'video/MP2T');
    ts.data.pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Segment load failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
