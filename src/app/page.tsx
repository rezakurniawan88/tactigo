import Navbar from '@/components/navbar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import TacticList from '@/components/tactic-list';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />
      <TacticList />
    </div>
  )
}