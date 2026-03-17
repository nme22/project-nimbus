import type { TodoCategory } from '@/types/todo';

const categories: { value: TodoCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
];

interface CategoryFilterProps {
  selected: TodoCategory | 'all';
  onChange: (category: TodoCategory | 'all') => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            selected === cat.value
              ? 'bg-primary text-white shadow-md'
              : 'bg-cloud-white text-foreground/70 hover:bg-light-gold/50'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
