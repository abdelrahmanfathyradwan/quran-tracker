import { NextResponse } from 'next/server';
import dns from 'dns';

export async function GET() {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  const servers = dns.getServers();
  let srv = null;
  let error = null;
  try {
    srv = await dns.promises.resolveSrv('_mongodb._tcp.cluster0.vzdb4oi.mongodb.net');
  } catch (e: any) {
    error = e.message;
  }
  return NextResponse.json({ servers, srv, error });
}
