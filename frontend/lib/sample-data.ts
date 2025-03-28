import {
  Book,
  Utensils,
  Home,
  Shirt,
  Palette,
  Calendar,
  Laptop,
  Car,
  Camera,
  Music,
  Scissors,
  ShoppingBag,
} from "lucide-react"
import type { Service, Provider, Category } from "./types"

// Sample Providers
export const providers: Provider[] = [
  {
    id: "p1",
    name: "John Mwangi",
    title: "Computer Science Student",
    rating: 4.9,
    reviews: 42,
    totalReviews: 42,
    badges: ["Programming", "Web Development", "Top Rated"],
  },
  {
    id: "p2",
    name: "Sarah Wanjiku",
    title: "Business Administration Student",
    rating: 4.8,
    reviews: 36,
    totalReviews: 36,
    badges: ["Food Delivery", "Fast Service", "Reliable"],
  },
  {
    id: "p3",
    name: "David Omondi",
    title: "Engineering Student",
    rating: 4.7,
    reviews: 28,
    totalReviews: 28,
    badges: ["Laundry", "Affordable", "Quick Turnaround"],
  },
  {
    id: "p4",
    name: "Mary Akinyi",
    title: "Education Student",
    rating: 4.6,
    reviews: 24,
    totalReviews: 24,
    badges: ["Tutoring", "Patient", "Experienced"],
  },
]

// Featured Providers
export const featuredProviders = providers

// Sample Categories
export const categories: Category[] = [
  {
    id: "c1",
    name: "Tutoring",
    icon: Book,
    count: 24,
  },
  {
    id: "c2",
    name: "Food Delivery",
    icon: Utensils,
    count: 18,
  },
  {
    id: "c3",
    name: "House Hunting",
    icon: Home,
    count: 12,
  },
  {
    id: "c4",
    name: "Laundry",
    icon: Shirt,
    count: 15,
  },
  {
    id: "c5",
    name: "Graphic Design",
    icon: Palette,
    count: 9,
  },
  {
    id: "c6",
    name: "Event Planning",
    icon: Calendar,
    count: 7,
  },
  {
    id: "c7",
    name: "Tech Support",
    icon: Laptop,
    count: 11,
  },
  {
    id: "c8",
    name: "Transportation",
    icon: Car,
    count: 8,
  },
  {
    id: "c9",
    name: "Photography",
    icon: Camera,
    count: 6,
  },
  {
    id: "c10",
    name: "Music Lessons",
    icon: Music,
    count: 5,
  },
  {
    id: "c11",
    name: "Haircuts",
    icon: Scissors,
    count: 10,
  },
  {
    id: "c12",
    name: "Shopping Assistant",
    icon: ShoppingBag,
    count: 4,
  },
]

// Sample Services
export const sampleServices: Service[] = [
  {
    id: "s1",
    title: "Programming Tutoring - Java, Python, JavaScript",
    category: "Tutoring",
    categoryId: "c1",
    price: 500,
    priceType: "per hour",
    location: "On Campus",
    rating: 4.9,
    reviews: 42,
    provider: providers[0],
    image: "/placeholder.svg?height=200&width=400",
    featured: true,
    description:
      "Get help with your programming assignments and learn coding concepts from an experienced tutor. I specialize in Java, Python, and JavaScript, and can help with web development projects as well.",
    features: [
      "One-on-one tutoring sessions",
      "Help with assignments and projects",
      "Flexible scheduling",
      "Online or in-person sessions",
    ],
  },
  {
    id: "s2",
    title: "Affordable Food Delivery - Campus Wide",
    category: "Food Delivery",
    categoryId: "c2",
    price: 50,
    priceType: "delivery fee",
    location: "Campus Wide",
    rating: 4.8,
    reviews: 36,
    provider: providers[1],
    image: "/placeholder.svg?height=200&width=400",
    discount: 20,
    availability: "Mon-Sat, 10am-8pm",
    deliveryTime: "30-45 minutes",
    description:
      "Hungry but too busy studying? I offer affordable food delivery from any restaurant around campus. Just tell me what you want and I'll deliver it to your dorm or study spot.",
    features: [
      "Fast delivery within 45 minutes",
      "Order from any restaurant near campus",
      "Affordable delivery fee",
      "Special discounts for regular customers",
    ],
  },
  {
    id: "s3",
    title: "Laundry Service - Wash, Dry & Fold",
    category: "Laundry",
    categoryId: "c4",
    price: 300,
    priceType: "per load",
    location: "Dorm Pickup",
    rating: 4.7,
    reviews: 28,
    provider: providers[2],
    image: "/placeholder.svg?height=200&width=400",
    availability: "Tue-Sun",
    deliveryTime: "24 hours",
    description:
      "No time for laundry? I offer a complete wash, dry, and fold service with pickup and delivery to your dorm. Your clothes will be returned clean, fresh, and neatly folded within 24 hours.",
    features: [
      "Pickup and delivery included",
      "24-hour turnaround time",
      "Eco-friendly detergent options",
      "Special care for delicate items",
    ],
  },
  {
    id: "s4",
    title: "Math & Science Tutoring - All Levels",
    category: "Tutoring",
    categoryId: "c1",
    price: 450,
    priceType: "per hour",
    location: "Library or Online",
    rating: 4.6,
    reviews: 24,
    provider: providers[3],
    image: "/placeholder.svg?height=200&width=400",
    featured: true,
    availability: "Evenings & Weekends",
    description:
      "Struggling with math or science courses? I can help! I offer tutoring in mathematics, physics, chemistry, and biology for all university levels. I explain complex concepts in simple terms and help you prepare for exams.",
    features: [
      "Patient and thorough explanations",
      "Practice problems and exam prep",
      "Flexible scheduling",
      "Group sessions available at discount",
    ],
  },
  {
    id: "s5",
    title: "Graphic Design Services - Logos, Posters & More",
    category: "Graphic Design",
    categoryId: "c5",
    price: 800,
    priceType: "starting price",
    location: "Remote",
    rating: 4.8,
    reviews: 19,
    provider: providers[0],
    image: "/placeholder.svg?height=200&width=400",
    description:
      "Need professional designs for your club, event, or personal project? I create eye-catching logos, posters, flyers, and social media graphics at student-friendly prices.",
    features: [
      "Custom designs tailored to your needs",
      "Quick turnaround time",
      "Multiple revision rounds included",
      "Digital files in any format you need",
    ],
  },
  {
    id: "s6",
    title: "Campus Event Photography",
    category: "Photography",
    categoryId: "c9",
    price: 1500,
    priceType: "per event",
    location: "On Campus",
    rating: 4.7,
    reviews: 15,
    provider: providers[1],
    image: "/placeholder.svg?height=200&width=400",
    discount: 15,
    description:
      "Capture your campus events with professional photography. I cover club events, parties, sports competitions, and more. You'll receive high-quality edited photos within 48 hours.",
    features: [
      "Professional equipment",
      "Edited photos delivered within 48 hours",
      "Both digital files and prints available",
      "Special discount for student organizations",
    ],
  },
  {
    id: "s7",
    title: "Room Cleaning Service",
    category: "House Hunting",
    categoryId: "c3",
    price: 400,
    priceType: "per session",
    location: "Dorms & Off-campus",
    rating: 4.5,
    reviews: 22,
    provider: providers[2],
    image: "/placeholder.svg?height=200&width=400",
    availability: "Weekends",
    description:
      "Keep your living space clean and tidy without the hassle. I offer thorough cleaning services for dorm rooms and off-campus apartments, including dusting, vacuuming, and bathroom cleaning.",
    features: [
      "Eco-friendly cleaning products",
      "Thorough cleaning of all surfaces",
      "Flexible scheduling",
      "Special deep cleaning option available",
    ],
  },
  {
    id: "s8",
    title: "Campus Ride Service",
    category: "Transportation",
    categoryId: "c8",
    price: 200,
    priceType: "per ride",
    location: "Campus & Town",
    rating: 4.9,
    reviews: 31,
    provider: providers[3],
    image: "/placeholder.svg?height=200&width=400",
    featured: true,
    availability: "Daily, 6am-11pm",
    description:
      "Need a ride to town for groceries or to the airport for holidays? I offer reliable transportation services at affordable rates. Safe, on-time, and convenient rides wherever you need to go.",
    features: [
      "Reliable and punctual service",
      "Clean and comfortable vehicle",
      "Advance booking available",
      "Group rates for shared rides",
    ],
  },
  {
    id: "s9",
    title: "Essay Proofreading & Editing",
    category: "Tutoring",
    categoryId: "c1",
    price: 250,
    priceType: "per 1000 words",
    location: "Online",
    rating: 4.8,
    reviews: 27,
    provider: providers[0],
    image: "/placeholder.svg?height=200&width=400",
    deliveryTime: "24-48 hours",
    description:
      "Improve your grades with professional proofreading and editing. I'll check your essays, reports, and papers for grammar, spelling, structure, and clarity to help you submit your best work.",
    features: [
      "Thorough grammar and spelling check",
      "Feedback on structure and clarity",
      "APA, MLA, Chicago style formatting",
      "Quick turnaround time",
    ],
  },
  {
    id: "s10",
    title: "Homemade Meal Prep Service",
    category: "Food Delivery",
    categoryId: "c2",
    price: 1200,
    priceType: "per week (5 meals)",
    location: "Campus Delivery",
    rating: 4.9,
    reviews: 33,
    provider: providers[1],
    image: "/placeholder.svg?height=200&width=400",
    featured: true,
    discount: 10,
    availability: "Weekly subscription",
    description:
      "No time to cook but tired of cafeteria food? Subscribe to my meal prep service for healthy, homemade meals delivered to your dorm. Choose from various menu options including vegetarian and vegan.",
    features: [
      "Fresh, homemade meals",
      "Customizable menu options",
      "Dietary restrictions accommodated",
      "Eco-friendly packaging",
    ],
  },
  {
    id: "s11",
    title: "Guitar Lessons for Beginners",
    category: "Music Lessons",
    categoryId: "c10",
    price: 400,
    priceType: "per hour",
    location: "Music Room or Online",
    rating: 4.7,
    reviews: 18,
    provider: providers[2],
    image: "/placeholder.svg?height=200&width=400",
    availability: "Evenings & Weekends",
    description:
      "Learn to play guitar from scratch! I offer beginner-friendly lessons that will have you playing your favorite songs in no time. Acoustic or electric guitar, all styles welcome.",
    features: [
      "Patient instruction for complete beginners",
      "Guitar provided if needed",
      "Learn popular songs quickly",
      "Music theory basics included",
    ],
  },
  {
    id: "s12",
    title: "Apartment Hunting Assistance",
    category: "House Hunting",
    categoryId: "c3",
    price: 1000,
    priceType: "flat fee",
    location: "Off-campus",
    rating: 4.8,
    reviews: 21,
    provider: providers[3],
    image: "/placeholder.svg?height=200&width=400",
    description:
      "Looking for off-campus housing can be stressful and time-consuming. I'll help you find the perfect apartment based on your budget and preferences, and assist with viewings and lease applications.",
    features: [
      "Personalized property recommendations",
      "Scheduling and accompanying viewings",
      "Lease review assistance",
      "Negotiation tips and support",
    ],
  },
]

