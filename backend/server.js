const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, User } = require('./models');
const seedDatabase = require('./seeders/seed');

const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/api/demo",(req,res)=> {
  console.log("---------Hello----------------");
  res.send("Hello world");
})

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/crm', require('./routes/crm'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/users', require('./routes/users'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/pipeline', require('./routes/pipeline'));

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Industrial Engineering PMO + ERP API is running...' });
});

const PORT = process.env.PORT || 6000;

const startServer = async () => {
  try {
    // Authenticate database
    await sequelize.authenticate();
    console.log('⚡ Database connection established successfully.');

    // Sync models
    const syncForce = process.env.DB_SYNC_FORCE === 'true';
    await sequelize.sync({ force: syncForce });
    
    // Check if we need to seed
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('⚡ Database empty. Seeding initial data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    console.error('❌ Check your database credentials or set USE_SQLITE=true in .env to use SQLite.');
    process.exit(1);
  }
};

startServer();
