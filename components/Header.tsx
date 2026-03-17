import { UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="text-center mb-10 relative">
      <div className="absolute right-0 top-0">
        <UserButton />
      </div>
      <div className="inline-flex items-center gap-3 mb-2">
        <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden="true">
          <ellipse cx="20" cy="18" rx="18" ry="8" fill="#FCEABB" />
          <ellipse cx="14" cy="15" rx="10" ry="7" fill="white" />
          <ellipse cx="26" cy="15" rx="10" ry="7" fill="white" />
          <ellipse cx="20" cy="13" rx="14" ry="8" fill="white" />
        </svg>
        <h1 className="text-4xl font-bold text-foreground">
          Project <span className="text-primary">Nimbus</span>
        </h1>
        <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden="true">
          <ellipse cx="20" cy="18" rx="18" ry="8" fill="#FCEABB" />
          <ellipse cx="14" cy="15" rx="10" ry="7" fill="white" />
          <ellipse cx="26" cy="15" rx="10" ry="7" fill="white" />
          <ellipse cx="20" cy="13" rx="14" ry="8" fill="white" />
        </svg>
      </div>
      <p className="text-foreground/60 text-lg">Your household projects, riding on a cloud</p>
    </header>
  );
}
