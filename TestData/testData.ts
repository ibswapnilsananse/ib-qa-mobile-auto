export interface FlightDetails {
  fromCity: string;
  toCity: string;
  fromDate: string;
  toDate: string;
}

export interface HotelsBookingDetails {
  location: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  fromDate: string;
  toDate: string;
  starRating: string;
  userRating: string;
  paymentType: string;
  isFreeCancellation: boolean;
}

export interface ContactDetails {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export interface TestData {
  flightDetails: FlightDetails;
  hotelsBookingDetails: HotelsBookingDetails;
  currencyList: string[];
  textOnTreesPage: string[];
  tabsOnWalletPage: string[];
  contactDetails: ContactDetails[];
}

export const testData: TestData = {
  flightDetails: {
    fromCity: "Delhi",
    toCity: "Pune",
    fromDate: "28 May",
    toDate: "04 Jun",
  },
  hotelsBookingDetails: {
    location: "Kathmandu",
    minPrice: 40,
    maxPrice: 340,
    sortBy: "User Rating (highest first)",
    fromDate: "20 May",
    toDate: "25 May",
    starRating: "+4",
    userRating: "Excellent",
    paymentType: "Pay Later",
    isFreeCancellation: true,
  },
  currencyList: ["US Dollar", "Hong Kong Dollar", "Indian Rupee"],
  textOnTreesPage: [
    "Start booking to plant trees!",
    "Make an impact when you book",
    "Did you know?",
    "Who do you partner with?",
    "How many trees has Hopper planted?",
    "What are some other ways to travel more sustainably?",
    "Learn more about traveling sustainably",
  ],
  tabsOnWalletPage: ["History", "Carrot Cash", "Added Funds"],
  contactDetails: [
    {
      firstName: "John",
      lastName: "Doe",
      phone: "+1-555-0101",
      email: "john.doe@example.com",
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      phone: "+1-555-0102",
      email: "jane.smith@example.com",
    },
    {
      firstName: "Bob",
      lastName: "Johnson",
      phone: "+1-555-0103",
      email: "bob.johnson@example.com",
    },
  ],
};
