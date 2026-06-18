import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Citizen, Officer } from '../models/User';
import { Incident, IncidentSeverity, IncidentStatus } from '../models/Incident';
import { Complaint, ComplaintType, ComplaintStatus, Priority } from '../models/Complaint';
import { DispatchRequest, DispatchStatus } from '../models/DispatchRequest';
import { FIR, FIRStatus } from '../models/FIR';

dotenv.config();

const randomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedActivity = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/securenet');
    console.log('Connected to MongoDB for seeding activity...');

    const citizens = await Citizen.find();
    const officers = await Officer.find();

    if (citizens.length === 0 || officers.length === 0) {
      console.log('No citizens or officers found. Please run seed-more.ts first.');
      process.exit(1);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const now = new Date();

    console.log('Generating 50 random incidents, complaints, dispatches and FIRs...');

    for (let i = 0; i < 50; i++) {
      const citizen = randomElement(citizens);
      const officer = randomElement(officers);
      const createdAt = randomDate(sevenDaysAgo, now);
      
      // 1. Create Complaint
      const complaintTypes = Object.values(ComplaintType);
      const isResolved = Math.random() > 0.4; // 60% resolved
      
      const complaint = await Complaint.create({
        citizenId: citizen._id,
        type: randomElement(complaintTypes),
        title: `Complaint Report ${i}`,
        description: `This is a randomly generated complaint for testing graphs.`,
        incidentDate: createdAt,
        location: {
          type: 'Point',
          coordinates: [77.2090 + (Math.random() * 0.1 - 0.05), 28.6139 + (Math.random() * 0.1 - 0.05)],
          address: 'Random Address, Delhi',
        },
        priority: randomElement(Object.values(Priority)),
        status: isResolved ? ComplaintStatus.RESOLVED : ComplaintStatus.IN_PROGRESS,
        assignedOfficerId: officer._id,
        createdAt,
        updatedAt: isResolved ? new Date(createdAt.getTime() + randomInt(1, 48) * 3600000) : createdAt,
      });

      // 2. Occasionally Create an FIR for resolved complaints
      if (isResolved && Math.random() > 0.5) {
        await FIR.create({
          firNumber: `FIR/DEL/2026/${randomInt(100000, 999999)}`,
          complaintId: complaint._id,
          complainantId: citizen._id,
          accusedDetails: 'Unknown suspect',
          incidentDetails: 'Generated incident details for testing.',
          witnesses: [],
          evidenceIds: [],
          officerRemarks: 'Processed normally.',
          draftedBy: officer._id,
          status: FIRStatus.FINALIZED,
          createdAt: new Date(createdAt.getTime() + 86400000), // +1 day
        });
      }

      // 3. Create Incident (SOS)
      const isIncidentResolved = Math.random() > 0.3; // 70% resolved
      const incidentStatus = isIncidentResolved ? IncidentStatus.RESOLVED : IncidentStatus.UNIT_EN_ROUTE;

      const incident = await Incident.create({
        citizenId: citizen._id,
        location: {
          type: 'Point',
          coordinates: [77.2090 + (Math.random() * 0.1 - 0.05), 28.6139 + (Math.random() * 0.1 - 0.05)],
        },
        servicesRequired: ['POLICE'],
        severity: randomElement(Object.values(IncidentSeverity)),
        status: incidentStatus,
        createdAt,
      });

      // 4. Create Dispatch Request
      const responseTimeMs = randomInt(5, 30) * 60000; // 5-30 minutes
      const dispatch = await DispatchRequest.create({
        incidentId: incident._id,
        unitId: officer._id,
        unitType: officer.officerType || 'POLICE',
        status: isIncidentResolved ? DispatchStatus.COMPLETED : DispatchStatus.EN_ROUTE,
        etaMinutes: 10,
        acceptedAt: new Date(createdAt.getTime() + 60000),
        completedAt: isIncidentResolved ? new Date(createdAt.getTime() + responseTimeMs) : undefined,
        createdAt,
      });

      // Link dispatch to incident
      incident.dispatchedUnits.push(dispatch._id as any);
      await incident.save();
    }

    console.log('Successfully seeded activity data for graphs.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding activity failed:', error);
    process.exit(1);
  }
};

seedActivity();
