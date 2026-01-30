import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-6xl font-bold mb-4 glitch-text" style={{ textShadow: '0 0 10px #00FF41' }}>
        PAYBACK
      </h1>
      <p className="text-xl text-gray-400 mb-8 max-w-md">
        SETTLE YOUR DEBTS. SURVIVE THE ECONOMY.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="primary">Log In</Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary">Register</Button>
        </Link>
      </div>
    </div>
  );
}
