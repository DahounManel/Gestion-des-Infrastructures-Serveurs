const express = require('express');
const app = express();

const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth.routes');
const rackRoutes = require('./routes/rack.routes');
const componentRoutes = require('./routes/component.routes');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/racks', auth, rackRoutes);
app.use('/api/components', auth, componentRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
});

module.exports = app;
