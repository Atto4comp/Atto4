// app/donate/page.tsx
import { Heart, CreditCard, Bitcoin } from 'lucide-react';
import Link from 'next/link';

// ✅ FORCE STATIC GENERATION
export const dynamic = 'force-static';

export const metadata = {
  title: 'Support Atto4 | Donate',
  description: 'Help keep Atto4 running by donating via Ko-fi or Crypto.',
};

export default function DonatePage() {
  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center pt-32 pb-20 px-4">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 mb-16 max-w-2xl">
        <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-full mb-4">
          <Heart className="w-8 h-8 text-red-500 fill-current animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-chillax">
          Support Atto4
        </h1>
        <p className="text-gray-400 text-lg">
          Atto4 is free and open source. Your donations help cover hosting costs and keep the platform ad-free and fast.
        </p>
      </div>

      {/* Donation Options Grid */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* OPTION 1: KO-FI (Cash/Card) */}
        <div className="group relative p-8 rounded-3xl bg-[#131313] border border-white/5 hover:border-[#FF5E5B]/50 transition-all hover:shadow-[0_0_30px_rgba(255,94,91,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Heart className="w-24 h-24" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-[#FF5E5B]/20 rounded-xl flex items-center justify-center mb-6 text-[#FF5E5B]">
              <CreditCard className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Coffee & Cash</h2>
            <p className="text-gray-400 mb-8 flex-grow">
              Support us with a one-time donation using PayPal or Card via Ko-fi. Simple and secure.
            </p>
            
            <a 
              href="https://ko-fi.com/YOUR_USERNAME" // REPLACE WITH YOUR KO-FI LINK
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl bg-[#FF5E5B] text-white font-bold text-center hover:bg-[#ff4845] transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 fill-white" />
              Donate on Ko-fi
            </a>
          </div>
        </div>

        {/* OPTION 2: OXAPAY (Crypto) */}
        <div className="group relative p-8 rounded-3xl bg-[#131313] border border-white/5 hover:border-[#F7931A]/50 transition-all hover:shadow-[0_0_30px_rgba(247,147,26,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bitcoin className="w-24 h-24" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-[#F7931A]/20 rounded-xl flex items-center justify-center mb-6 text-[#F7931A]">
              <Bitcoin className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Crypto</h2>
            <p className="text-gray-400 mb-8 flex-grow">
              Prefer privacy? Support us using Bitcoin, Ethereum, USDT, or Tron via OxaPay.
            </p>
            
            <a 
              href="https://oxapay.com/donate/YOUR_LINK_ID" // REPLACE WITH YOUR OXAPAY LINK
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl bg-white text-black font-bold text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Bitcoin className="w-5 h-5" />
              Donate Crypto
            </a>
          </div>
        </div>

      </div>

      {/* Footer Note */}
      <div className="mt-16 text-center">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm border-b border-transparent hover:border-gray-500">
          No thanks, take me back home
        </Link>
      </div>
    </div>
  );
}
