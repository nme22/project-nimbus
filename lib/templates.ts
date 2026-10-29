import type { Category, Room } from '@/types/project';

export interface ProjectTemplate {
  id: string;
  title: string;
  icon: string;
  room: Room;
  category: Category;
  description: string;
  tasks: string[];
  /** Material names; each becomes an unpriced shopping item you can look up at a store. */
  materials: string[];
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'paint-room',
    title: 'Paint a room',
    icon: '🎨',
    room: 'bedroom',
    category: 'painting',
    description: 'Prep, prime, and repaint walls and trim.',
    tasks: [
      'Pick colors and get samples',
      'Move furniture and cover floors',
      'Patch holes and sand',
      'Tape trim and outlets',
      'Prime patched areas',
      'Cut in edges',
      'Roll two coats',
      'Remove tape and clean up',
    ],
    materials: [
      'Interior paint (gallon)',
      'Primer',
      "Painter's tape",
      'Drop cloth',
      'Roller frame and covers',
      'Angled brush 2.5 in',
      'Paint tray',
      'Spackle and putty knife',
      'Sanding sponge',
    ],
  },
  {
    id: 'replace-faucet',
    title: 'Replace a faucet',
    icon: '🚰',
    room: 'kitchen',
    category: 'plumbing',
    description: 'Swap out an old kitchen or bathroom faucet.',
    tasks: [
      'Measure sink holes and pick faucet',
      'Shut off water supply',
      'Disconnect and remove old faucet',
      'Clean sink deck',
      'Install new faucet and supply lines',
      'Turn water on and check for leaks',
    ],
    materials: ['Faucet', 'Braided supply lines', "Plumber's putty", 'Basin wrench', 'Teflon tape'],
  },
  {
    id: 'ceiling-fan',
    title: 'Install a ceiling fan',
    icon: '🌀',
    room: 'living_room',
    category: 'electrical',
    description: 'Replace a light fixture with a ceiling fan.',
    tasks: [
      'Confirm box is fan-rated',
      'Turn off breaker and test wires',
      'Remove old fixture',
      'Install fan bracket and motor',
      'Wire fan and light kit',
      'Attach blades and test',
    ],
    materials: ['Ceiling fan', 'Fan-rated electrical box', 'Wire nuts', 'Voltage tester'],
  },
  {
    id: 'garden-bed',
    title: 'Build a raised garden bed',
    icon: '🥕',
    room: 'yard',
    category: 'landscaping',
    description: 'Build and fill a raised bed for vegetables.',
    tasks: [
      'Choose location and measure',
      'Cut lumber to size',
      'Assemble frame',
      'Level ground and set frame',
      'Lay weed barrier',
      'Fill with soil and compost',
      'Plant',
    ],
    materials: ['Cedar boards 2x8', 'Exterior wood screws', 'Landscape fabric', 'Raised bed soil', 'Compost'],
  },
  {
    id: 'recaulk-tub',
    title: 'Re-caulk tub or shower',
    icon: '🛁',
    room: 'bathroom',
    category: 'general',
    description: 'Remove old caulk and reseal.',
    tasks: ['Remove old caulk', 'Clean and dry joint', 'Tape lines', 'Apply new caulk', 'Let cure 24 hours'],
    materials: ['Silicone kitchen and bath caulk', 'Caulk remover tool', 'Caulk gun', "Painter's tape"],
  },
  {
    id: 'smart-thermostat',
    title: 'Install a smart thermostat',
    icon: '🌡️',
    room: 'whole_house',
    category: 'hvac',
    description: 'Upgrade to a smart thermostat.',
    tasks: [
      'Check wiring compatibility (C-wire)',
      'Turn off HVAC power',
      'Label wires and remove old thermostat',
      'Mount and wire new base',
      'Power on and run setup',
    ],
    materials: ['Smart thermostat', 'C-wire adapter', 'Wall plate'],
  },
];
