const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Initialize passport configuration
const configurePassport = require('./config/passportConfig');
configurePassport();

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediroute');
  console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
};

const app = express();

// 1. HTTP Security Headers via Helmet
app.use(helmet());

// 2. Cookie Parser (for secure refreshToken cookies)
app.use(cookieParser());

// 3. Body Parser Middleware
app.use(express.json());

// 4. Secure CORS Settings
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Request Origin is not authorized.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 5. Input Sanitization (NoSQL injection and XSS mitigation)
const { xssSanitizer, nosqlSanitizer, csrfCheck } = require('./middleware/securityHeaders');
app.use(nosqlSanitizer);
app.use(xssSanitizer);

// 6. CSRF Request Protection
app.use(csrfCheck);

// 7. Rate Limiter Middleware
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// 8. Passport initialization
app.use(passport.initialize());

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
    message: 'MediRoute AI Secured Backend API is running successfully.'
  });
});

// Database Auto-Seeder Logic
const seedDatabase = async () => {
  try {
    const User = require('./models/User');
    const Hospital = require('./models/Hospital');
    const Doctor = require('./models/Doctor');

    // Seed default roles if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding default accounts...');
      
      // Default Super Admin
      await User.create({
        name: 'MediRoute Super Admin',
        email: 'superadmin@mediroute.com',
        password: 'superadmin123',
        role: 'super_admin',
        isEmailVerified: true
      });

      // Default Patient
      await User.create({
        name: 'John Doe',
        email: 'patient@mediroute.com',
        password: 'patient123',
        role: 'patient',
        isEmailVerified: true
      });

      // Seeding a Doctor account for resource demonstration
      await User.create({
        name: 'Dr. Sarah Connor',
        email: 'doctor@mediroute.com',
        password: 'doctor123',
        role: 'doctor',
        isEmailVerified: true
      });
      
      console.log('✅ Accounts seeded:');
      console.log('   - superadmin@mediroute.com (superadmin123) [super_admin]');
      console.log('   - patient@mediroute.com (patient123) [patient]');
      console.log('   - doctor@mediroute.com (doctor123) [doctor]');
    }

    // Seed Hospitals if empty
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

    // Seed Doctors if empty
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
    await connectDB();
    await seedDatabase();
  } catch (err) {
    console.log('Running backend in standalone state...', err.message);
  }
  
  app.listen(PORT, () => {
    console.log(`🔥 Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();

