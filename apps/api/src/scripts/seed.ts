import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Citizen, Officer, ControlRoomOperator, Authority, Role } from '../models/User';
import { Station, Ambulance } from '../models/Resource';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/securenet');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany({});
      }
      console.log('Database collections cleared.');
    }

    const passwordHash = await bcrypt.hash('password123', 12);

    // 1. Create Police Station
    const policeStation = await Station.create({
      name: 'Central Police Station',
      type: 'POLICE',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
      coverageRadiusKm: 20,
      availableUnits: 5,
    });

    // 2. Create Ambulance
    const ambulance = await Ambulance.create({
      licensePlate: 'DL-1A-1234',
      status: 'AVAILABLE',
      currentLocation: { type: 'Point', coordinates: [77.2095, 28.6140] },
    });

    // 3. Create Users
    const citizen = await Citizen.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'citizen@securenet.com',
      phone: '+919876543210',
      passwordHash,
      role: Role.CITIZEN,
      isVerified: true,
      govtIdType: 'AADHAAR',
      govtIdNumber: '1234-5678-9012',
      govtIdVerified: true,
      trustedContacts: ['+919876543211'],
    });

    const officer1 = await Officer.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'officer@securenet.com',
      phone: '+919876543220',
      passwordHash,
      role: Role.OFFICER,
      isVerified: true,
      badgeNumber: 'POL-12345',
      officerType: 'POLICE',
      stationId: policeStation._id,
      status: 'AVAILABLE',
      currentLocation: { type: 'Point', coordinates: [77.2091, 28.6138] },
    });

    const officer2 = await Officer.create({
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'fire@securenet.com',
      phone: '+919876543221',
      passwordHash,
      role: Role.OFFICER,
      isVerified: true,
      badgeNumber: 'FIR-12345',
      officerType: 'FIRE',
      stationId: policeStation._id,
      status: 'AVAILABLE',
      currentLocation: { type: 'Point', coordinates: [77.2092, 28.6139] },
    });

    const officer3 = await Officer.create({
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'medic@securenet.com',
      phone: '+919876543222',
      passwordHash,
      role: Role.OFFICER,
      isVerified: true,
      badgeNumber: 'AMB-12345',
      officerType: 'AMBULANCE',
      stationId: policeStation._id,
      status: 'AVAILABLE',
      currentLocation: { type: 'Point', coordinates: [77.2093, 28.6140] },
    });

    const controlRoom = await ControlRoomOperator.create({
      firstName: 'Control',
      lastName: 'Room',
      email: 'control@securenet.com',
      phone: '+919876543230',
      passwordHash,
      role: Role.CONTROL_ROOM,
      isVerified: true,
      zoneId: 'ZONE-CENTRAL',
    });

    const authority = await Authority.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@securenet.com',
      phone: '+919876543240',
      passwordHash,
      role: Role.AUTHORITY,
      isVerified: true,
      level: 'STATE',
      jurisdiction: 'Delhi NCR',
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
