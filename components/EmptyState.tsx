export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mb-6 opacity-60">
        <ellipse cx="60" cy="50" rx="50" ry="20" fill="#FCEABB" />
        <ellipse cx="40" cy="45" rx="25" ry="15" fill="#FFF3E0" />
        <ellipse cx="80" cy="45" rx="25" ry="15" fill="#FFF3E0" />
        <ellipse cx="60" cy="40" rx="35" ry="18" fill="white" />
        <ellipse cx="45" cy="38" rx="20" ry="12" fill="white" />
        <ellipse cx="75" cy="38" rx="20" ry="12" fill="white" />
      </svg>
      <h3 className="text-xl font-semibold text-foreground/70 mb-2">No projects yet</h3>
      <p className="text-foreground/50 max-w-sm">
        Your Flying Nimbus is waiting! Add your first household project to get started.
      </p>
    </div>
  );
}
