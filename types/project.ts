export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type Room =
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'living_room'
  | 'dining_room'
  | 'office'
  | 'laundry'
  | 'garage'
  | 'basement'
  | 'attic'
  | 'exterior'
  | 'yard'
  | 'whole_house'
  | 'other';
export type Category =
  | 'general'
  | 'plumbing'
  | 'electrical'
  | 'painting'
  | 'carpentry'
  | 'flooring'
  | 'hvac'
  | 'roofing'
  | 'landscaping'
  | 'cleaning'
  | 'appliances'
  | 'other';
export type Store = 'home_depot' | 'lowes' | 'other';

export interface Project {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  room: Room;
  category: Category;
  status: ProjectStatus;
  priority: Priority;
  budget: number | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'> & {
  user_id?: string | null;
};
export type ProjectUpdate = Partial<ProjectInsert>;

export interface Task {
  id: string;
  project_id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export type TaskInsert = Pick<Task, 'project_id' | 'title'> & Partial<Pick<Task, 'done' | 'due_date' | 'position'>>;
export type TaskUpdate = Partial<Pick<Task, 'title' | 'done' | 'due_date' | 'position'>>;

export interface ShoppingItem {
  id: string;
  project_id: string;
  task_id: string | null;
  name: string;
  store: Store;
  product_id: string | null;
  model: string | null;
  url: string | null;
  image_url: string | null;
  unit_price: number | null;
  quantity: number;
  purchased: boolean;
  created_at: string;
  updated_at: string;
}

export type ShoppingItemInsert = Pick<ShoppingItem, 'project_id' | 'name'> &
  Partial<Omit<ShoppingItem, 'id' | 'project_id' | 'name' | 'created_at' | 'updated_at'>>;
export type ShoppingItemUpdate = Partial<Omit<ShoppingItem, 'id' | 'project_id' | 'created_at' | 'updated_at'>>;

/** Project row plus the lightweight child data the dashboard needs for progress + spend. */
export interface ProjectSummary extends Project {
  tasks: Pick<Task, 'id' | 'done'>[];
  shopping_items: Pick<ShoppingItem, 'id' | 'unit_price' | 'quantity' | 'purchased'>[];
}

export interface ProjectWithChildren extends Project {
  tasks: Task[];
  shopping_items: ShoppingItem[];
}

export interface ShoppingItemWithProject extends ShoppingItem {
  project: Pick<Project, 'id' | 'title' | 'room'> | null;
}

/** A product returned by the catalog search API. */
export interface CatalogProduct {
  store: Exclude<Store, 'other'>;
  productId: string | null;
  title: string;
  brand: string | null;
  model: string | null;
  price: number | null;
  url: string;
  thumbnail: string | null;
  rating: number | null;
  reviews: number | null;
}

export interface CatalogSearchResponse {
  store: Exclude<Store, 'other'>;
  query: string;
  /** False when no live catalog provider is configured for this store. */
  live: boolean;
  products: CatalogProduct[];
  /** Link to run the same search on the retailer's site. */
  searchUrl: string;
  error?: string;
}
