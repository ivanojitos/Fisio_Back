// require('dotenv').config(); // soempre

const app = require('./src/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API running on port ${PORT}`);
});