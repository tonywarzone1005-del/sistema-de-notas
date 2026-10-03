import Image from 'next/image';

interface LogoProps {
  variant?: 'circular' | 'horizontal';
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({
  variant = 'horizontal',
  width,
  height,
  className = '',
}: LogoProps) {
  if (variant === 'circular') {
    return (
      <Image
        src="/logo-ubv.png"
        alt="Universidad Bolivariana de Venezuela"
        width={width ?? 120}
        height={height ?? 120}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/logo-ubv-horizontal.png"
      alt="UBV - Profesionales Líderes del Socialismo"
      width={width ?? 280}
      height={height ?? 60}
      className={className}
      priority
    />
  );
}