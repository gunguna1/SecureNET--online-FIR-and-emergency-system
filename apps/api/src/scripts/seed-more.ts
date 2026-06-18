import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Citizen, Officer, Role } from '../models/User';
import { Station } from '../models/Resource';

dotenv.config();

const seedMore = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/securenet');
    console.log('Connected to MongoDB for adding more users...');

    const passwordHash = await bcrypt.hash('password123', 12);
    const station = await Station.findOne();
    const stationId = station ? station._id : new mongoose.Types.ObjectId();

    // Add 10 Citizens
    for (let i = 2; i <= 11; i++) {
      try {
        await Citizen.create({
          firstName: 'Citizen',
          lastName: `${i}`,
          email: `citizen${i}@securenet.com`,
          phone: `+9180000000${i.toString().padStart(2, '0')}`,
          passwordHash,
          role: Role.CITIZEN,
          isVerified: true,
          govtIdType: 'AADHAAR',
          govtIdNumber: `8000-0000-00${i.toString().padStart(2, '0')}`,
          govtIdVerified: true,
          trustedContacts: [],
        });
      } catch(e: any) {
        if(e.code !== 11000) throw e;
      }
    }

    // Add 10 Police Officers
    for (let i = 2; i <= 11; i++) {
      try {
        await Officer.create({
          firstName: 'Police',
          lastName: `Officer${i}`,
          email: `officer${i}@securenet.com`,
          phone: `+9180000001${i.toString().padStart(2, '0')}`,
          passwordHash,
          role: Role.OFFICER,
          isVerified: true,
          badgeNumber: `POL-8000${i.toString().padStart(2, '0')}`,
          officerType: 'POLICE',
          stationId: stationId,
          status: 'AVAILABLE',
          currentLocation: { type: 'Point', coordinates: [77.2091, 28.6138] },
        });
      } catch(e: any) {
        if(e.code !== 11000) throw e;
      }
    }

    // Add 10 Fire Officers
    for (let i = 2; i <= 11; i++) {
      try {
        await Officer.create({
          firstName: 'Fire',
          lastName: `Officer${i}`,
          email: `fire${i}@securenet.com`,
          phone: `+9180000002${i.toString().padStart(2, '0')}`,
          passwordHash,
          role: Role.OFFICER,
          isVerified: true,
          badgeNumber: `FIR-8000${i.toString().padStart(2, '0')}`,
          officerType: 'FIRE',
          stationId: stationId,
          status: 'AVAILABLE',
          currentLocation: { type: 'Point', coordinates: [77.2092, 28.6139] },
        });
      } catch(e: any) {
        if(e.code !== 11000) throw e;
      }
    }

    // Add 10 Medic Officers
    for (let i = 2; i <= 11; i++) {
      try {
        await Officer.create({
          firstName: 'Medic',
          lastName: `Officer${i}`,
          email: `medic${i}@securenet.com`,
          phone: `+9180000003${i.toString().padStart(2, '0')}`,
          passwordHash,
          role: Role.OFFICER,
          isVerified: true,
          badgeNumber: `AMB-8000${i.toString().padStart(2, '0')}`,
          officerType: 'AMBULANCE',
          stationId: stationId,
          status: 'AVAILABLE',
          currentLocation: { type: 'Point', coordinates: [77.2093, 28.6140] },
        });
      } catch(e: any) {
        if(e.code !== 11000) throw e;
      }
    }

    console.log('Successfully added 10 citizens, 10 police officers, 10 fire officers, and 10 medic officers.');
    process.exit(0);
  } catch (error) {
    console.error('Adding users failed:', error);
    process.exit(1);
  }
};

seedMore();
