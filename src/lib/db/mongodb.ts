import { MongoClient, Db } from 'mongodb';
import dns from 'node:dns';

// Force Node.js to use Cloudflare/Google DNS to bypass system DNS filters that block MongoDB
dns.setServers(['1.1.1.1', '8.8.8.8']);

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;

// Manually resolve SRV record to bypass MongoDB driver's internal DNS resolution
async function resolveSRVUri(mongodbSrvUri: string): Promise<string> {
  if (!mongodbSrvUri.startsWith('mongodb+srv://')) {
    return mongodbSrvUri; // Not an SRV URI, return as-is
  }

  const url = new URL(mongodbSrvUri);
  const hostname = url.hostname;
  const dbName = url.pathname.replace(/^\//, '');
  const searchParams = new URLSearchParams(url.search);

  const srvRecords = await new Promise<dns.SrvRecord[]>((resolve, reject) => {
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });

  if (!srvRecords || srvRecords.length === 0) {
    throw new Error('No SRV records found');
  }

  // Also resolve TXT record for replica set name and auth source
  let txtRecord = '';
  try {
    const txtRecords = await new Promise<string[][]>((resolve, reject) => {
      dns.resolveTxt(hostname, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });
    if (txtRecords && txtRecords.length > 0) {
      txtRecord = txtRecords[0].join('');
    }
  } catch (err) {
    // Use defaults if TXT record not found
  }

  // Parse TXT record for replica set name and auth source
  const txtParams = new URLSearchParams(txtRecord);
  const replicaSet = txtParams.get('replicaSet') || 'cluster0-shard-0';
  const authSource = txtParams.get('authSource') || 'admin';

  // Build connection string with all hosts for replica set
  const hosts = srvRecords.map(srv => `${srv.name}:${srv.port}`).join(',');
  const directUri = `mongodb://${url.username}:${url.password}@${hosts}/${dbName}?replicaSet=${replicaSet}&authSource=${authSource}&tls=true&${searchParams.toString()}`;

  return directUri;
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development, use a global variable so the MongoClient is not
// repeatedly created during hot-reloading.
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

async function createClientPromise(): Promise<MongoClient> {
  const resolvedUri = await resolveSRVUri(uri);
  client = new MongoClient(resolvedUri, options);
  return client.connect();
}

if (process.env.NODE_ENV === 'development') {
  if (!globalWithMongo._mongoClientPromise) {
    clientPromise = createClientPromise();
    globalWithMongo._mongoClientPromise = clientPromise;
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}
