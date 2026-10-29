import type { Category, Priority, ProjectStatus, Room, Store } from '@/types/project';

export const roomOptions: { value: Room; label: string; icon: string }[] = [
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🛁' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'living_room', label: 'Living Room', icon: '🛋️' },
  { value: 'dining_room', label: 'Dining Room', icon: '🍽️' },
  { value: 'office', label: 'Office', icon: '💻' },
  { value: 'laundry', label: 'Laundry', icon: '🧺' },
  { value: 'garage', label: 'Garage', icon: '🚗' },
  { value: 'basement', label: 'Basement', icon: '🧱' },
  { value: 'attic', label: 'Attic', icon: '📦' },
  { value: 'exterior', label: 'Exterior', icon: '🏠' },
  { value: 'yard', label: 'Yard & Garden', icon: '🌳' },
  { value: 'whole_house', label: 'Whole House', icon: '🏡' },
  { value: 'other', label: 'Other', icon: '✨' },
];

export const categoryOptions: { value: Category; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'other', label: 'Other' },
];

export const statusOptions: { value: ProjectStatus; label: string; className: string }[] = [
  { value: 'planning', label: 'Planning', className: 'bg-status-pending/20 text-[#B4740A]' },
  { value: 'in_progress', label: 'In Progress', className: 'bg-status-in-progress/15 text-status-in-progress' },
  { value: 'on_hold', label: 'On Hold', className: 'bg-foreground/10 text-foreground/60' },
  { value: 'completed', label: 'Completed', className: 'bg-status-completed/15 text-[#15803D]' },
];

export const priorityOptions: { value: Priority; label: string; className: string; border: string }[] = [
  { value: 'low', label: 'Low', className: 'bg-priority-low/15 text-[#15803D]', border: 'border-l-priority-low' },
  { value: 'medium', label: 'Medium', className: 'bg-priority-medium/20 text-[#B4740A]', border: 'border-l-priority-medium' },
  { value: 'high', label: 'High', className: 'bg-priority-high/15 text-[#C2410C]', border: 'border-l-priority-high' },
];

export const storeOptions: { value: Store; label: string; className: string }[] = [
  { value: 'home_depot', label: 'Home Depot', className: 'bg-home-depot text-white' },
  { value: 'lowes', label: "Lowe's", className: 'bg-lowes text-white' },
  { value: 'other', label: 'Other', className: 'bg-foreground/10 text-foreground/70' },
];

function lookup<T extends { value: string }>(list: T[], value: string): T {
  return list.find((o) => o.value === value) ?? list[list.length - 1];
}

export const roomOf = (v: Room) => lookup(roomOptions, v);
export const categoryOf = (v: Category) => lookup(categoryOptions, v);
export const statusOf = (v: ProjectStatus) => lookup(statusOptions, v);
export const priorityOf = (v: Priority) => lookup(priorityOptions, v);
export const storeOf = (v: Store) => lookup(storeOptions, v);
