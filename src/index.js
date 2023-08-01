const _path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static(_path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(_path.join(__dirname, 'public','pages', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at \x1b[33m http://localhost:${port} \x1b[0m`);
});
