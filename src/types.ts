export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "appetizer" | "pho" | "beverage" | "dessert";
  image: string;
  dietary?: ("gluten-free" | "vegan" | "vegetarian" | "spicy")[];
  popular?: boolean;
}

export interface CustomPhoBowl {
  broth: string;
  noodle: string;
  proteins: string[];
  toppings: string[];
  size: "regular" | "large";
  price: number;
}

export interface CartItem {
  id: string; // unique cart id (can be menu itemId or computed custom pho id)
  menuItem?: MenuItem;
  customBowl?: CustomPhoBowl;
  quantity: number;
  specialInstructions?: string;
  price: number; // total for ONE item (including custom add-on premiums)
}

export interface Reservation {
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  seatingPreference: "main" | "booth" | "patio" | "bar";
  occassion?: string;
  specialRequests?: string;
}
