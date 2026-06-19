// Reference generated high-quality images as static strings served by Vite
const phoHero = "/src/assets/images/pho_hero_banner_1779818126548.png";
const springRolls = "/src/assets/images/spring_rolls_appetizer_1779818144886.png";
const icedCoffee = "/src/assets/images/iced_coffee_beverage_1779818164228.png";

import { MenuItem } from "./types";

export const RESTAURANT_INFO = {
  name: "Phở Harmony",
  tagline: "Authentic 24-Hour Slipped & Simmered Vietnamese Noodle Bar",
  phone: "(415) 555-0192",
  email: "hello@phoharmony.com",
  address: "832 Valencia St, San Francisco, CA 94110",
  hours: [
    { days: "Mon – Thu", time: "11:00 AM – 9:30 PM" },
    { days: "Fri – Sat", time: "11:00 AM – 10:30 PM" },
    { days: "Sunday", time: "12:00 PM – 9:00 PM" },
  ],
  story: "At Phở Harmony, our soul lies in our broth. We honors centuries-old Hanoi and Saigon traditions, slow-simmering grass-fed beef bones and free-range chicken for over 24 hours. Infused with black cardamom, star anise, charred ginger, and premium fish sauce from Phú Quốc, every bowl is a harmonious balance of deep marrow flavor and delicate, comforting aromatics.",
};

export const MENU_ITEMS: MenuItem[] = [
  // Appetizers
  {
    id: "app-1",
    name: "Classic Rice Paper Spring Rolls (Gỏi Cuốn)",
    description: "Two freshly rolled translucent rice paper wraps filled with poached tiger shrimp, pork loin, fragrant mint, organic lettuce, and vermicelli noodle. Served with our house rich peanut-hoisin dipping sauce.",
    price: 8.50,
    category: "appetizer",
    image: springRolls,
    dietary: ["gluten-free"],
    popular: true,
  },
  {
    id: "app-2",
    name: "Crispy Imperial Egg Rolls (Chả Giò)",
    description: "Three light, crispy golden rolls filled with minced pork, wood-ear mushrooms, glass noodles, and carrots. Served with fresh lettuce leaves to wrap, mint, and house chili-lime dipping sauce (Nước Chấm).",
    price: 9.00,
    category: "appetizer",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80", // delicious crispy rolls fallback
    dietary: [],
  },
  {
    id: "app-3",
    name: "Roasted Lemongrass Glazed Chicken Wings",
    description: "Crispy chicken wings tossed in a sticky, savory lemongrass glaze, caramelized garlic, house fish sauce, and garnished with fresh scallions and bird's eye chilies.",
    price: 11.50,
    category: "appetizer",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
    popular: true,
  },

  // Main Pho Bowls
  {
    id: "pho-1",
    name: "The Emperor's Pho (Phở Đặc Biệt)",
    description: "Our signature ultimate bowl with a lavish combination of rare beef ribeye, tender slow-cooked beef brisket, beef meatballs, and melt-in-the-mouth soft tendon in our legendary 24-hour spiced marrow broth.",
    price: 17.50,
    category: "pho",
    image: phoHero,
    dietary: ["gluten-free"],
    popular: true,
  },
  {
    id: "pho-2",
    name: "Hanoi Beef Ribeye Pho (Phở Tái)",
    description: "Thinly sliced hand-cut grass-fed rare eye of round steak, perfectly poached when the piping-hot aromatic broth is poured over the tender rice noodles. Topped with fresh scallions, coriander, and yellow onions.",
    price: 15.50,
    category: "pho",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
    dietary: ["gluten-free"],
  },
  {
    id: "pho-3",
    name: "Free-Range Ginger-Infused Chicken Pho (Phở Gà)",
    description: "Shredded organic free-range chicken breast in a crystal-clear, delicate double-infused chicken broth carrying aromatic hints of fresh ginger, roasted coriander seeds, and dry key lime leaves.",
    price: 15.00,
    category: "pho",
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&auto=format&fit=crop&q=80",
    dietary: ["gluten-free"],
  },
  {
    id: "pho-4",
    name: "Sacred Garden Herbal Pho (Phở Chay)",
    description: "100% plant-based golden broth extracted from roasted root vegetables, apples, pears, and warm spices. Packed with organic tofu triangles, trumpet mushrooms, baby bok choy, and market-fresh vegetables.",
    price: 14.50,
    category: "pho",
    image: "https://images.unsplash.com/photo-1511910849309-0d5f2cdd885e?w=600&auto=format&fit=crop&q=80",
    dietary: ["gluten-free", "vegan", "vegetarian"],
    popular: true,
  },

  // Beverages & Desserts
  {
    id: "bev-1",
    name: "Drip-Filter Vietnamese Iced Coffee (Cà Phê Sữa Đá)",
    description: "Brewed slow with dark roasted chicory-infused French café du monde beans using a traditional metal Phin filter, sweetened with thick, velvet condensed milk and shaken vigorously over crushed ice.",
    price: 5.50,
    category: "beverage",
    image: icedCoffee,
    popular: true,
  },
  {
    id: "bev-2",
    name: "Fresh Pressed Sugarcane Juice (Nước Mía)",
    description: "Freshly squeezed sugarcane stalks pressed with dynamic splashes of sweet kumquat, carrying an incredibly refreshing, naturally sweet botanical finish.",
    price: 6.00,
    category: "beverage",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=80",
    dietary: ["gluten-free", "vegan", "vegetarian"],
  },
  {
    id: "bev-3",
    name: "Artisanal Iced Lotus seed Tea (Trà Hạt Sen)",
    description: "Fragrant cold-brewed lotus tea lightly sweetened and garnished with soft, nutty slow-cooked lotus seeds and fresh longan fruit.",
    price: 5.00,
    category: "beverage",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    dietary: ["gluten-free", "vegan", "vegetarian"],
  },
  {
    id: "des-1",
    name: "Coconut Pandan Crème Caramel (Bánh Flan)",
    description: "A silky, luscious Vietnamese egg custard infused with sweet aromatic pandan leaf juice, baked beautifully over a rich, bittersweet caramelized coffee glaze.",
    price: 7.50,
    category: "dessert",
    image: "https://images.unsplash.com/photo-1515003844-1d981820d29b?w=600&auto=format&fit=crop&q=80",
    dietary: ["gluten-free", "vegetarian"],
    popular: true,
  },
];

export const BUILD_YOUR_OWN_PRESETS = {
  broths: [
    { id: "signature-beef", name: "24Hr Spiced Beef Broth", description: "Our rich, star-anise and beef marrow reduction", addOn: 0, vegan: false },
    { id: "citrus-chicken", name: "Ginger & Chicken Broth", description: "Light, clear, and infused with fresh key lime leaves", addOn: 0, vegan: false },
    { id: "golden-vegan", name: "100% Herbal Shii-take Broth", description: "Sweet double-steeped root veggie and mushroom extract", addOn: 0, vegan: true },
  ],
  noodles: [
    { id: "flat-rice", name: "Fresh Flat Rice Noodles (Bánh Phở)", description: "Traditional delicate, silky width", addOn: 0 },
    { id: "thick-bun", name: "Thick Round Rice Noodles (Bún)", description: "Chewy, robust noodle experience", addOn: 0.5 },
    { id: "zucchini", name: "Fresh Julienned Zucchini Noodles", description: "Low-carb crisp vegetable strands", addOn: 1.50 },
  ],
  proteins: [
    { id: "rare-beef", name: "Rare Sliced Eye-Round (Tái)", price: 3.50 },
    { id: "brisket", name: "Slow-Cooked Flat Brisket (Nạm)", price: 3.00 },
    { id: "meatballs", name: "Vietnamese Beef Meatballs (Bò Viên)", price: 2.50 },
    { id: "chicken", name: "Shredded Free-Range Poached Chicken", price: 3.00 },
    { id: "tofu", name: "Fried Organic Tofu Puffs", price: 2.00 },
    { id: "trumpet-mushrooms", name: "Caramelized Trumpet Mushrooms", price: 2.50 },
  ],
  toppings: [
    { id: "bean-sprouts", name: "Crispy Bean Sprouts (Sông)", price: 0 },
    { id: "basil", name: "Thai Holy Basil Leaves", price: 0 },
    { id: "scallion-cilantro", name: "Scallion Oil & Fresh Cilantro", price: 0 },
    { id: "onion", name: "Pickled Sweet Onions (Hành Giấm)", price: 0 },
    { id: "jalapeno", name: "Sliced Jalapeño Peppers", price: 0 },
    { id: "saw-leaf", name: "Saw-leaf Herb (Ngò Gai)", price: 0.50 },
    { id: "poached-egg", name: "Poached Broth-steeped Egg (Nước Tiết)", price: 1.50 },
    { id: "chili-oil", name: "House Roasted Szechuan Lemongrass Chili Sate", price: 0.25 },
  ],
};

export const REVIEWS = [
  {
    name: "Lan Anh Nguyen",
    status: "Verified Food Writer",
    text: "The beef brisket literally dissolved in my mouth, and that broth has a golden transparency yet feels so deep, like my grandmother would simmer in Hanoi! The sate chili oil is outstanding.",
    stars: 5,
  },
  {
    name: "Marcus Sterling",
    status: "Valencia St Neighbor",
    text: "Being able to customize my bowl down to the saw-leaf herb and noodle thickness on this web builder is marvelous. Everything is hyper-fresh, and the packaging for take-out keeps the soup piping hot!",
    stars: 5,
  },
  {
    name: "Chloé Dupont",
    status: "Vietnamese Food Enthusiast",
    text: "The Pandan Flán is a masterpiece of silky texture, and they actually serve Trà Hạt Sen with real lotus seeds! Phở Harmony is easily my absolute favorite comfort spot in the city.",
    stars: 5,
  },
];
