const mongoose = require('mongoose');
require('dotenv').config({ path: 'C:/PROJECTS/SecureNET--online-FIR-and-emergency-system/apps/api/.env' });
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const DispatchRequest = mongoose.connection.collection('dispatchrequests');
  await DispatchRequest.updateMany({ unitType: { $exists: false } }, { $set: { unitType: 'POLICE' } });
  console.log('Fixed missing unitTypes!');
  process.exit(0);
}
run().catch(console.error);
