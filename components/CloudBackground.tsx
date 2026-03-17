export default function CloudBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {/* Top-left cloud */}
      <svg className="absolute -top-10 -left-20 opacity-30" width="300" height="150" viewBox="0 0 300 150" fill="none">
        <ellipse cx="150" cy="100" rx="130" ry="40" fill="#FCEABB" />
        <ellipse cx="100" cy="90" rx="80" ry="35" fill="white" />
        <ellipse cx="200" cy="90" rx="80" ry="35" fill="white" />
        <ellipse cx="150" cy="80" rx="100" ry="40" fill="white" />
      </svg>
      {/* Top-right cloud */}
      <svg className="absolute -top-5 right-0 opacity-20" width="250" height="120" viewBox="0 0 250 120" fill="none">
        <ellipse cx="125" cy="80" rx="110" ry="35" fill="#FCEABB" />
        <ellipse cx="80" cy="70" rx="70" ry="30" fill="white" />
        <ellipse cx="170" cy="70" rx="70" ry="30" fill="white" />
        <ellipse cx="125" cy="60" rx="90" ry="35" fill="white" />
      </svg>
      {/* Bottom-left cloud */}
      <svg className="absolute bottom-10 left-10 opacity-15" width="200" height="100" viewBox="0 0 200 100" fill="none">
        <ellipse cx="100" cy="65" rx="90" ry="30" fill="#FCEABB" />
        <ellipse cx="70" cy="55" rx="55" ry="25" fill="white" />
        <ellipse cx="130" cy="55" rx="55" ry="25" fill="white" />
        <ellipse cx="100" cy="50" rx="70" ry="30" fill="white" />
      </svg>
      {/* Bottom-right cloud */}
      <svg className="absolute bottom-20 right-20 opacity-20" width="180" height="90" viewBox="0 0 180 90" fill="none">
        <ellipse cx="90" cy="60" rx="80" ry="25" fill="#FCEABB" />
        <ellipse cx="60" cy="50" rx="50" ry="22" fill="white" />
        <ellipse cx="120" cy="50" rx="50" ry="22" fill="white" />
        <ellipse cx="90" cy="45" rx="65" ry="25" fill="white" />
      </svg>
    </div>
  );
}
