'use client';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from './Icons';

export default function FlechaAtras({ label = 'Volver', href }: { label?: string; href?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm"
    >
      <IconArrowLeft className="w-4 h-4 mr-1" />
      {label}
    </button>
  );
}