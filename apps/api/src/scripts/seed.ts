import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Citizen, Officer, ControlRoomOperator, Authority, Role } from '../models/User';
import { Station, Ambulance } from '../models/Resource';
import { Incident, IncidentSeverity, IncidentStatus } from '../models/Incident';
import { DispatchRequest } from '../models/DispatchRequest';
import { Complaint, ComplaintType, ComplaintStatus, Priority } from '../models/Complaint';

dotenv.config();

const indianFirstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharva", "Aarush", "Dev", "Ritvik", "Aryan", "Dhruv", "Kabir", "Rishabh", "Yuvraj", "Rahul", "Aanya", "Diya", "Ananya", "Pari", "Kavya", "Sanya", "Avni", "Sneha", "Aditi", "Isha", "Riya", "Aarohi", "Shruti", "Tanvi", "Neha", "Mitali", "Pooja", "Megha", "Gargi", "Nisha", "Ritu", "Swati", "Sonal", "Jyoti", "Kiran", "Bhavna", "Kirti", "Preeti", "Sunita"];
const indianLastNames = ["Sharma", "Verma", "Singh", "Yadav", "Gupta", "Kumar", "Choudhary", "Patel", "Reddy", "Mishra", "Joshi", "Pandey", "Rajput", "Rao", "Das", "Bose", "Mehta", "Nair", "Iyer", "Pillai", "Chauhan", "Bhatia", "Kapoor", "Malhotra", "Kaur", "Ahluwalia", "Agarwal", "Bansal", "Garg", "Srivastava", "Tiwari", "Dube", "Chatterjee", "Banerjee", "Mukherjee", "Roy", "Sen", "Nath", "Ghosh", "Basu", "Rathor", "Thakur", "Prasad", "Sinha", "Narayan", "Menon", "Krishnan", "Hegde", "Shetty", "Desai"];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const getRandomPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
};

const getRandomCityLocation = () => {
  const cities = [
    { lon: 77.2, lat: 28.6 }, // Delhi
    { lon: 72.8, lat: 19.0 }, // Mumbai
    { lon: 77.5, lat: 12.9 }  // Bengaluru
  ];
  const city = getRandomElement(cities);
  return {
    type: 'Point',
    coordinates: [city.lon + (Math.random() * 0.2 - 0.1), city.lat + (Math.random() * 0.2 - 0.1)]
  };
};

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
    const adminPasswordHash = await bcrypt.hash('Anshikkyadav@512', 12);

    // 1. Create Police Station & Ambulance
    const policeStation = await Station.create({
      name: 'Central Police Station',
      type: 'POLICE',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
      coverageRadiusKm: 20,
      availableUnits: 15,
    });

    await Ambulance.create({
      licensePlate: 'DL-1A-1234',
      status: 'AVAILABLE',
      currentLocation: { type: 'Point', coordinates: [77.2095, 28.6140] },
    });

    // 2. Create 50 Citizens
    const citizens: any[] = [];
    for (let i = 0; i < 50; i++) {
      const citizen = await Citizen.create({
        firstName: getRandomElement(indianFirstNames),
        lastName: getRandomElement(indianLastNames),
        email: `citizen${i}@securenet.com`,
        phone: `+919876500${i.toString().padStart(3, '0')}`,
        passwordHash,
        role: Role.CITIZEN,
        isVerified: true,
        govtIdType: 'AADHAAR',
        govtIdNumber: `1234-5678-90${i.toString().padStart(2, '0')}`,
        govtIdVerified: true,
        trustedContacts: [],
      });
      citizens.push(citizen);
    }
    
    const dummyCitizen = await Citizen.create({
      firstName: 'John', lastName: 'Doe', email: 'citizen@securenet.com',
      phone: '+919876543210', passwordHash, role: Role.CITIZEN, isVerified: true,
      govtIdType: 'AADHAAR', govtIdNumber: '1234-5678-9012', govtIdVerified: true,
      trustedContacts: [],
    });

    // 3. Create Officers (5 Police, 5 Fire, 5 Medic)
    const policeOfficers = [];
    const fireOfficers = [];
    const medicOfficers = [];

    // The Heroes (Ankit = Police, Navesh = Fire, Khushi = Medic)
    const heroPolice = await Officer.create({
      firstName: 'Ankit', lastName: 'Choudhary', email: 'ankit@securenet.com',
      phone: '+919000000001', passwordHash, role: Role.OFFICER, isVerified: true,
      badgeNumber: 'POL-HERO1', officerType: 'POLICE', stationId: policeStation._id,
      status: 'AVAILABLE', currentLocation: { type: 'Point', coordinates: [77.2091, 28.6138] },
    });
    policeOfficers.push(heroPolice);

    const heroFire = await Officer.create({
      firstName: 'Navesh', lastName: 'Singh', email: 'navesh@securenet.com',
      phone: '+919000000002', passwordHash, role: Role.OFFICER, isVerified: true,
      badgeNumber: 'FIR-HERO1', officerType: 'FIRE', stationId: policeStation._id,
      status: 'AVAILABLE', currentLocation: { type: 'Point', coordinates: [77.2092, 28.6139] },
    });
    fireOfficers.push(heroFire);

    const heroMedic = await Officer.create({
      firstName: 'Khushi', lastName: ' ', email: 'khushi@securenet.com',
      phone: '+919000000003', passwordHash, role: Role.OFFICER, isVerified: true,
      badgeNumber: 'AMB-HERO1', officerType: 'AMBULANCE', stationId: policeStation._id,
      status: 'AVAILABLE', currentLocation: { type: 'Point', coordinates: [77.2093, 28.6140] },
    });
    medicOfficers.push(heroMedic);

    // Other 4 each
    for (let i = 0; i < 4; i++) {
      await Officer.create({
        firstName: getRandomElement(indianFirstNames), lastName: getRandomElement(indianLastNames),
        email: `police${i}@securenet.com`, phone: `+91800000010${i}`, passwordHash,
        role: Role.OFFICER, isVerified: true, badgeNumber: `POL-100${i}`, officerType: 'POLICE',
        stationId: policeStation._id, status: 'AVAILABLE', currentLocation: { type: 'Point', coordinates: [77.2091, 28.6138] },
      });
      await Officer.create({
        firstName: getRandomElement(indianFirstNames), lastName: getRandomElement(indianLastNames),
        email: `fire${i}@securenet.com`, phone: `+91800000020${i}`, passwordHash,
        role: Role.OFFICER, isVerified: true, badgeNumber: `FIR-100${i}`, officerType: 'FIRE',
        stationId: policeStation._id, status: 'AVAILABLE', currentLocation: { type: 'Point', coordinates: [77.2092, 28.6139] },
      });
      await Officer.create({
        firstName: getRandomElement(indianFirstNames), lastName: getRandomElement(indianLastNames),
        email: `medic${i}@securenet.com`, phone: `+91800000030${i}`, passwordHash,
        role: Role.OFFICER, isVerified: true, badgeNumber: `AMB-100${i}`, officerType: 'AMBULANCE',
        stationId: policeStation._id, status: 'AVAILABLE', currentLocation: { type: 'Point', coordinates: [77.2093, 28.6140] },
      });
    }
    
    // Original dummy accounts
    await Officer.create({
      firstName: 'Jane', lastName: 'Smith', email: 'officer@securenet.com',
      phone: '+919876543220', passwordHash, role: Role.OFFICER, isVerified: true,
      badgeNumber: 'POL-12345', officerType: 'POLICE', stationId: policeStation._id, status: 'AVAILABLE',
      currentLocation: { type: 'Point', coordinates: [77.2091, 28.6138] },
    });

    const controlRoom = await ControlRoomOperator.create({
      firstName: 'Control', lastName: 'Room', email: 'control@securenet.com',
      phone: '+919876543230', passwordHash, role: Role.CONTROL_ROOM, isVerified: true,
      zoneId: 'ZONE-CENTRAL',
    });

    const authority = await Authority.create({
      firstName: 'Admin', lastName: 'User', email: 'admin@securenet.com',
      phone: '+919876543240', passwordHash: adminPasswordHash, role: Role.AUTHORITY, isVerified: true,
      level: 'STATE', jurisdiction: 'Delhi NCR',
    });

    // 4. Create resolved incidents to make the 3 specific officers heroes
    // Ankit (Police): 15, Navesh (Fire): 18, Khushi (Medic): 24
    
    const resolveCases = async (officerId: mongoose.Types.ObjectId, unitType: string, count: number, service: string) => {
      for (let i = 0; i < count; i++) {
        const pastDate = getRandomPastDate(30);
        const completedDate = new Date(pastDate.getTime() + 1000 * 60 * (20 + Math.random() * 30));
        
        // Use insertMany to bypass Mongoose timestamp generation and force past dates
        const incArray = await Incident.insertMany([{
          citizenId: citizens[i % citizens.length]._id,
          location: getRandomCityLocation(),
          servicesRequired: [service], severity: IncidentSeverity.HIGH, status: IncidentStatus.RESOLVED,
          createdAt: pastDate, updatedAt: completedDate
        }]);
        const pInc = incArray[0];
        
        await DispatchRequest.insertMany([{
          incidentId: pInc._id, unitId: officerId, unitType: unitType, status: 'COMPLETED',
          dispatchedAt: pastDate, completedAt: completedDate,
          createdAt: pastDate, updatedAt: completedDate
        }]);
      }
    };

    await resolveCases(heroPolice._id, 'POLICE', 15, 'POLICE');
    await resolveCases(heroFire._id, 'FIRE', 18, 'FIRE');
    await resolveCases(heroMedic._id, 'AMBULANCE', 24, 'AMBULANCE');

    // 5. Create 37 new active incidents around Delhi, Mumbai, Bengaluru with random dates over last 5 days
    const activeIncidents = [];
    for (let i = 0; i < 37; i++) {
      const pastDate = getRandomPastDate(5);
      activeIncidents.push({
        citizenId: citizens[i % citizens.length]._id,
        location: getRandomCityLocation(),
        servicesRequired: [getRandomElement(['POLICE', 'FIRE', 'AMBULANCE'])],
        severity: getRandomElement([IncidentSeverity.MEDIUM, IncidentSeverity.HIGH, IncidentSeverity.CRITICAL]),
        status: getRandomElement([IncidentStatus.SOS_SENT, IncidentStatus.ACKNOWLEDGED, IncidentStatus.UNIT_DISPATCHED]),
        createdAt: pastDate, updatedAt: pastDate
      });
    }
    await Incident.insertMany(activeIncidents);

    // Dashboard dummy incidents
    await Incident.create({
      citizenId: dummyCitizen._id,
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
      servicesRequired: ['POLICE', 'AMBULANCE'],
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.SOS_SENT,
    });

    // 6. Create 32 different FIRs (Complaints)
    const complaints = [];
    const types = Object.values(ComplaintType);
    for (let i = 0; i < 32; i++) {
      const pastDate = getRandomPastDate(60);
      complaints.push({
        citizenId: citizens[i % citizens.length]._id,
        type: getRandomElement(types),
        title: `Incident Report ${i + 1}`,
        description: `Detailed description for FIR ${i + 1}`,
        incidentDate: getRandomPastDate(65),
        location: getRandomCityLocation(),
        priority: getRandomElement(Object.values(Priority)),
        status: getRandomElement(Object.values(ComplaintStatus)),
        createdAt: pastDate,
        updatedAt: pastDate
      });
    }
    await Complaint.insertMany(complaints);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
