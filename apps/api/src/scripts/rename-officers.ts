import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Officer, Citizen } from '../models/User';

dotenv.config();

const firstNames = [
  'Amit', 'Rohan', 'Vikram', 'Suresh', 'Ramesh', 'Anil', 'Sanjay', 
  'Rajesh', 'Manoj', 'Rakesh', 'Vijay', 'Ajay', 'Rahul', 'Sunil', 
  'Deepak', 'Arun', 'Prakash', 'Sandeep', 'Nitin', 'Naveen'
];

const lastNames = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Patel', 'Yadav', 
  'Reddy', 'Das', 'Mishra', 'Chauhan', 'Rao', 'Iyer', 'Pillai', 
  'Joshi', 'Chaudhary', 'Thakur', 'Nair', 'Bhat', 'Deshmukh'
];

const randomName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { first, last };
};

const renameUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/securenet');
    console.log('Connected to MongoDB for renaming users...');

    const usersToRename = [
      ...Array.from({ length: 10 }, (_, i) => `citizen${i + 2}@securenet.com`),
      ...Array.from({ length: 10 }, (_, i) => `officer${i + 2}@securenet.com`),
      ...Array.from({ length: 10 }, (_, i) => `fire${i + 2}@securenet.com`),
      ...Array.from({ length: 10 }, (_, i) => `medic${i + 2}@securenet.com`)
    ];

    for (const email of usersToRename) {
      const { first, last } = randomName();
      
      let Model: any = Officer;
      if (email.startsWith('citizen')) {
        Model = Citizen;
      }

      await Model.updateOne(
        { email },
        { $set: { firstName: first, lastName: last } }
      );
    }

    console.log('Successfully renamed all seeded users to realistic names.');
    process.exit(0);
  } catch (error) {
    console.error('Renaming failed:', error);
    process.exit(1);
  }
};

renameUsers();
