const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediroute');
  console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
};
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Body Parser Middleware
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for standard hackathon flexibility
  credentials: true
}));

// Route files
const authRoutes = require('./routes/auth');
const triageRoutes = require('./routes/triage');
const hospitalRoutes = require('./routes/hospitals');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Base route for server health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'MediRoute AI Backend API is running successfully.'
  });
});

// Database Auto-Seeder Logic
const seedDatabase = async () => {
  try {
    const User = require('./models/User');
    const Hospital = require('./models/Hospital');
    const Doctor = require('./models/Doctor');

    // 1. Seed Admin & Patient if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding default accounts...');
      
      // Default Admin
      await User.create({
        name: 'MediRoute Admin',
        email: 'admin@mediroute.com',
        password: 'admin123', // Will be hashed automatically by userSchema pre-save hook
        role: 'admin'
      });

      // Default Patient
      await User.create({
        name: 'John Doe',
        email: 'patient@mediroute.com',
        password: 'patient123',
        role: 'patient'
      });
      
      console.log('✅ Accounts seeded: admin@mediroute.com (admin123) & patient@mediroute.com (patient123)');
    }

    // 2. Seed Hospitals if empty
    const hospitalCount = await Hospital.countDocuments();
    let hospitalIds = [];
    if (hospitalCount === 0) {
      console.log('🌱 Seeding mock hospitals...');
      const hospitals = await Hospital.create([
        {
          name: 'City Central General Hospital',
          address: '742 Evergreen Terrace',
          city: 'Metropolis',
          distance: 1.2,
          bedsAvailable: 42,
          bedsTotal: 150,
          icuAvailable: 8,
          icuTotal: 20,
          contactPhone: '+91 98765 43210'
        },
        {
          name: 'Apollo Apex Medical Center',
          address: '12 Web Avenue, Tech Park',
          city: 'Metropolis',
          distance: 2.8,
          bedsAvailable: 89,
          bedsTotal: 250,
          icuAvailable: 15,
          icuTotal: 40,
          contactPhone: '+91 91234 56789'
        },
        {
          name: 'St. Grace Wellness Clinic',
          address: '404 Route Boulevard',
          city: 'Metropolis',
          distance: 4.5,
          bedsAvailable: 14,
          bedsTotal: 50,
          icuAvailable: 2,
          icuTotal: 5,
          contactPhone: '+91 88888 77777'
        }
      ]);
      hospitalIds = hospitals.map(h => h._id);
      console.log('✅ Hospitals seeded.');
    } else {
      const existingHospitals = await Hospital.find();
      hospitalIds = existingHospitals.map(h => h._id);
    }

    // 3. Seed Doctors if empty
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0 && hospitalIds.length > 0) {
      console.log('🌱 Seeding mock doctors...');
      await Doctor.create([
        {
          name: 'Dr. Sarah Connor',
          specialty: 'Cardiologist',
          experience: 12,
          hospital: hospitalIds[0],
          availability: 'Available',
          rating: 4.8
        },
        {
          name: 'Dr. Alan Grant',
          specialty: 'Dermatologist',
          experience: 8,
          hospital: hospitalIds[1],
          availability: 'Available',
          rating: 4.6
        },
        {
          name: 'Dr. Ellie Sattler',
          specialty: 'Ophthalmologist',
          experience: 9,
          hospital: hospitalIds[2],
          availability: 'Available',
          rating: 4.9
        },
        {
          name: 'Dr. Ian Malcolm',
          specialty: 'General Physician',
          experience: 15,
          hospital: hospitalIds[0],
          availability: 'Busy',
          rating: 4.7
        },
        {
          name: 'Dr. Stephen Strange',
          specialty: 'Orthopedic Specialist',
          experience: 14,
          hospital: hospitalIds[1],
          availability: 'Available',
          rating: 5.0
        },
        {
          name: 'Dr. Bruce Banner',
          specialty: 'Neurologist',
          experience: 11,
          hospital: hospitalIds[2],
          availability: 'Available',
          rating: 4.5
        },
        {
          name: 'Dr. Gregory House',
          specialty: 'General Physician',
          experience: 20,
          hospital: hospitalIds[1],
          availability: 'Available',
          rating: 4.8
        }
      ]);
      console.log('✅ Doctors seeded.');
    }
  } catch (err) {
    console.error(`❌ Seeder Error: ${err.message}`);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    const connectDB = require('./config/db');
    await connectDB();
    await seedDatabase();
  } catch (err) {
    console.log('Running backend in standalone state...');
  }
  
  app.listen(PORT, () => {
    console.log(`🔥 Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
