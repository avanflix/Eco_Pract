/**
 * Seed US pincodes into the database.
 * Run: npx tsx scripts/seed-pincodes.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI missing in .env.local");

const PincodeSchema = new mongoose.Schema(
  {
    pincode: { type: String, required: true, unique: true, index: true },
    city: String, state: String, country: { type: String, default: "US" },
    isDeliverable: { type: Boolean, default: true },
    deliveryDays: { type: Number, default: 5 },
    zone: String,
    salesTaxRate: { type: Number, default: 0.08 },
  },
  { collection: "pincodes" }
);
const Pincode = mongoose.models.Pincode || mongoose.model("Pincode", PincodeSchema);

const usPincodes = [
  // New York
  { pincode: "10001", city: "New York", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "10002", city: "New York", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "10003", city: "New York", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "10016", city: "New York", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "10036", city: "New York", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "10128", city: "New York", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "11201", city: "Brooklyn", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "11211", city: "Brooklyn", state: "NY", zone: "East", salesTaxRate: 0.08875, deliveryDays: 3 },
  { pincode: "12207", city: "Albany", state: "NY", zone: "East", salesTaxRate: 0.08, deliveryDays: 4 },
  { pincode: "14202", city: "Buffalo", state: "NY", zone: "East", salesTaxRate: 0.08, deliveryDays: 4 },
  // California
  { pincode: "90001", city: "Los Angeles", state: "CA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "90210", city: "Beverly Hills", state: "CA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "90401", city: "Santa Monica", state: "CA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "91001", city: "Altadena", state: "CA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "94102", city: "San Francisco", state: "CA", zone: "West", salesTaxRate: 0.0875, deliveryDays: 4 },
  { pincode: "94103", city: "San Francisco", state: "CA", zone: "West", salesTaxRate: 0.0875, deliveryDays: 4 },
  { pincode: "94105", city: "San Francisco", state: "CA", zone: "West", salesTaxRate: 0.0875, deliveryDays: 4 },
  { pincode: "95101", city: "San Jose", state: "CA", zone: "West", salesTaxRate: 0.09375, deliveryDays: 4 },
  { pincode: "95110", city: "San Jose", state: "CA", zone: "West", salesTaxRate: 0.09375, deliveryDays: 4 },
  { pincode: "92101", city: "San Diego", state: "CA", zone: "West", salesTaxRate: 0.0775, deliveryDays: 4 },
  { pincode: "92102", city: "San Diego", state: "CA", zone: "West", salesTaxRate: 0.0775, deliveryDays: 4 },
  { pincode: "91910", city: "Chula Vista", state: "CA", zone: "West", salesTaxRate: 0.0775, deliveryDays: 4 },
  { pincode: "92614", city: "Irvine", state: "CA", zone: "West", salesTaxRate: 0.0775, deliveryDays: 4 },
  // Texas
  { pincode: "75001", city: "Addison", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75201", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75202", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75205", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75206", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75207", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75208", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75209", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75210", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "75211", city: "Dallas", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "77001", city: "Houston", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "77002", city: "Houston", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "77003", city: "Houston", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "77004", city: "Houston", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "77005", city: "Houston", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "77201", city: "Houston", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "78201", city: "San Antonio", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "78202", city: "San Antonio", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "73301", city: "Austin", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  { pincode: "73302", city: "Austin", state: "TX", zone: "Central", salesTaxRate: 0.0825, deliveryDays: 4 },
  // Florida
  { pincode: "33101", city: "Miami", state: "FL", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "33102", city: "Miami", state: "FL", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "33103", city: "Miami", state: "FL", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "33104", city: "Miami", state: "FL", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "33109", city: "Miami", state: "FL", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "32099", city: "Jacksonville", state: "FL", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "33602", city: "Tampa", state: "FL", zone: "East", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "33603", city: "Tampa", state: "FL", zone: "East", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "33604", city: "Tampa", state: "FL", zone: "East", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "33701", city: "St. Petersburg", state: "FL", zone: "East", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "32801", city: "Orlando", state: "FL", zone: "East", salesTaxRate: 0.065, deliveryDays: 4 },
  { pincode: "32802", city: "Orlando", state: "FL", zone: "East", salesTaxRate: 0.065, deliveryDays: 4 },
  { pincode: "32803", city: "Orlando", state: "FL", zone: "East", salesTaxRate: 0.065, deliveryDays: 4 },
  // Illinois
  { pincode: "60601", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "60602", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "60603", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "60604", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "60605", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "60606", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "60607", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  { pincode: "60611", city: "Chicago", state: "IL", zone: "Central", salesTaxRate: 0.1025, deliveryDays: 4 },
  // Washington
  { pincode: "98101", city: "Seattle", state: "WA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 5 },
  { pincode: "98102", city: "Seattle", state: "WA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 5 },
  { pincode: "98103", city: "Seattle", state: "WA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 5 },
  { pincode: "98104", city: "Seattle", state: "WA", zone: "West", salesTaxRate: 0.1025, deliveryDays: 5 },
  // Massachusetts
  { pincode: "02101", city: "Boston", state: "MA", zone: "East", salesTaxRate: 0.0625, deliveryDays: 3 },
  { pincode: "02102", city: "Boston", state: "MA", zone: "East", salesTaxRate: 0.0625, deliveryDays: 3 },
  { pincode: "02103", city: "Boston", state: "MA", zone: "East", salesTaxRate: 0.0625, deliveryDays: 3 },
  { pincode: "02104", city: "Boston", state: "MA", zone: "East", salesTaxRate: 0.0625, deliveryDays: 3 },
  { pincode: "02105", city: "Boston", state: "MA", zone: "East", salesTaxRate: 0.0625, deliveryDays: 3 },
  { pincode: "02115", city: "Boston", state: "MA", zone: "East", salesTaxRate: 0.0625, deliveryDays: 3 },
  { pincode: "02108", city: "Boston", state: "MA", zone: "East", salesTaxRate: 0.0625, deliveryDays: 3 },
  // Georgia
  { pincode: "30301", city: "Atlanta", state: "GA", zone: "East", salesTaxRate: 0.089, deliveryDays: 4 },
  { pincode: "30302", city: "Atlanta", state: "GA", zone: "East", salesTaxRate: 0.089, deliveryDays: 4 },
  { pincode: "30303", city: "Atlanta", state: "GA", zone: "East", salesTaxRate: 0.089, deliveryDays: 4 },
  { pincode: "30304", city: "Atlanta", state: "GA", zone: "East", salesTaxRate: 0.089, deliveryDays: 4 },
  { pincode: "30305", city: "Atlanta", state: "GA", zone: "East", salesTaxRate: 0.089, deliveryDays: 4 },
  { pincode: "30306", city: "Atlanta", state: "GA", zone: "East", salesTaxRate: 0.089, deliveryDays: 4 },
  // Arizona
  { pincode: "85001", city: "Phoenix", state: "AZ", zone: "West", salesTaxRate: 0.086, deliveryDays: 5 },
  { pincode: "85002", city: "Phoenix", state: "AZ", zone: "West", salesTaxRate: 0.086, deliveryDays: 5 },
  { pincode: "85003", city: "Phoenix", state: "AZ", zone: "West", salesTaxRate: 0.086, deliveryDays: 5 },
  { pincode: "85701", city: "Tucson", state: "AZ", zone: "West", salesTaxRate: 0.086, deliveryDays: 5 },
  { pincode: "85702", city: "Tucson", state: "AZ", zone: "West", salesTaxRate: 0.086, deliveryDays: 5 },
  // Colorado
  { pincode: "80201", city: "Denver", state: "CO", zone: "Central", salesTaxRate: 0.0882, deliveryDays: 5 },
  { pincode: "80202", city: "Denver", state: "CO", zone: "Central", salesTaxRate: 0.0882, deliveryDays: 5 },
  { pincode: "80203", city: "Denver", state: "CO", zone: "Central", salesTaxRate: 0.0882, deliveryDays: 5 },
  { pincode: "80204", city: "Denver", state: "CO", zone: "Central", salesTaxRate: 0.0882, deliveryDays: 5 },
  { pincode: "80205", city: "Denver", state: "CO", zone: "Central", salesTaxRate: 0.0882, deliveryDays: 5 },
  { pincode: "80301", city: "Boulder", state: "CO", zone: "Central", salesTaxRate: 0.0882, deliveryDays: 5 },
  // Nevada
  { pincode: "89101", city: "Las Vegas", state: "NV", zone: "West", salesTaxRate: 0.0838, deliveryDays: 5 },
  { pincode: "89102", city: "Las Vegas", state: "NV", zone: "West", salesTaxRate: 0.0838, deliveryDays: 5 },
  { pincode: "89103", city: "Las Vegas", state: "NV", zone: "West", salesTaxRate: 0.0838, deliveryDays: 5 },
  { pincode: "89104", city: "Las Vegas", state: "NV", zone: "West", salesTaxRate: 0.0838, deliveryDays: 5 },
  { pincode: "89501", city: "Reno", state: "NV", zone: "West", salesTaxRate: 0.0838, deliveryDays: 5 },
  // Oregon
  { pincode: "97201", city: "Portland", state: "OR", zone: "West", salesTaxRate: 0, deliveryDays: 5 },
  { pincode: "97202", city: "Portland", state: "OR", zone: "West", salesTaxRate: 0, deliveryDays: 5 },
  { pincode: "97203", city: "Portland", state: "OR", zone: "West", salesTaxRate: 0, deliveryDays: 5 },
  { pincode: "97204", city: "Gresham", state: "OR", zone: "West", salesTaxRate: 0, deliveryDays: 5 },
  { pincode: "97205", city: "Portland", state: "OR", zone: "West", salesTaxRate: 0, deliveryDays: 5 },
  // Minnesota
  { pincode: "55401", city: "Minneapolis", state: "MN", zone: "Central", salesTaxRate: 0.0888, deliveryDays: 5 },
  { pincode: "55402", city: "Minneapolis", state: "MN", zone: "Central", salesTaxRate: 0.0888, deliveryDays: 5 },
  { pincode: "55403", city: "Minneapolis", state: "MN", zone: "Central", salesTaxRate: 0.0888, deliveryDays: 5 },
  { pincode: "55404", city: "Minneapolis", state: "MN", zone: "Central", salesTaxRate: 0.0888, deliveryDays: 5 },
  { pincode: "55405", city: "Minneapolis", state: "MN", zone: "Central", salesTaxRate: 0.0888, deliveryDays: 5 },
  { pincode: "55455", city: "Minneapolis", state: "MN", zone: "Central", salesTaxRate: 0.0888, deliveryDays: 5 },
  { pincode: "55414", city: "Minneapolis", state: "MN", zone: "Central", salesTaxRate: 0.0888, deliveryDays: 5 },
  // Michigan
  { pincode: "48201", city: "Detroit", state: "MI", zone: "Central", salesTaxRate: 0.06, deliveryDays: 4 },
  { pincode: "48202", city: "Detroit", state: "MI", zone: "Central", salesTaxRate: 0.06, deliveryDays: 4 },
  { pincode: "48203", city: "Detroit", state: "MI", zone: "Central", salesTaxRate: 0.06, deliveryDays: 4 },
  { pincode: "48204", city: "Detroit", state: "MI", zone: "Central", salesTaxRate: 0.06, deliveryDays: 4 },
  { pincode: "48205", city: "Detroit", state: "MI", zone: "Central", salesTaxRate: 0.06, deliveryDays: 4 },
  // Pennsylvania
  { pincode: "19101", city: "Philadelphia", state: "PA", zone: "East", salesTaxRate: 0.08, deliveryDays: 3 },
  { pincode: "19102", city: "Philadelphia", state: "PA", zone: "East", salesTaxRate: 0.08, deliveryDays: 3 },
  { pincode: "19103", city: "Philadelphia", state: "PA", zone: "East", salesTaxRate: 0.08, deliveryDays: 3 },
  { pincode: "19104", city: "Philadelphia", state: "PA", zone: "East", salesTaxRate: 0.08, deliveryDays: 3 },
  { pincode: "19106", city: "Philadelphia", state: "PA", zone: "East", salesTaxRate: 0.08, deliveryDays: 3 },
  { pincode: "19107", city: "Philadelphia", state: "PA", zone: "East", salesTaxRate: 0.08, deliveryDays: 3 },
  { pincode: "15201", city: "Pittsburgh", state: "PA", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "15202", city: "Pittsburgh", state: "PA", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "15203", city: "Pittsburgh", state: "PA", zone: "East", salesTaxRate: 0.07, deliveryDays: 4 },
  // Ohio
  { pincode: "43201", city: "Columbus", state: "OH", zone: "Central", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "43202", city: "Columbus", state: "OH", zone: "Central", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "43203", city: "Columbus", state: "OH", zone: "Central", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "43204", city: "Columbus", state: "OH", zone: "Central", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "43205", city: "Columbus", state: "OH", zone: "Central", salesTaxRate: 0.075, deliveryDays: 4 },
  { pincode: "44101", city: "Cleveland", state: "OH", zone: "Central", salesTaxRate: 0.08, deliveryDays: 4 },
  { pincode: "44102", city: "Cleveland", state: "OH", zone: "Central", salesTaxRate: 0.08, deliveryDays: 4 },
  { pincode: "44103", city: "Cleveland", state: "OH", zone: "Central", salesTaxRate: 0.08, deliveryDays: 4 },
  // North Carolina
  { pincode: "27601", city: "Raleigh", state: "NC", zone: "East", salesTaxRate: 0.0775, deliveryDays: 4 },
  { pincode: "27602", city: "Raleigh", state: "NC", zone: "East", salesTaxRate: 0.0775, deliveryDays: 4 },
  { pincode: "28201", city: "Charlotte", state: "NC", zone: "East", salesTaxRate: 0.0775, deliveryDays: 4 },
  { pincode: "28202", city: "Charlotte", state: "NC", zone: "East", salesTaxRate: 0.0775, deliveryDays: 4 },
  { pincode: "28203", city: "Charlotte", state: "NC", zone: "East", salesTaxRate: 0.0775, deliveryDays: 4 },
  // New Jersey
  { pincode: "07001", city: "Avenel", state: "NJ", zone: "East", salesTaxRate: 0.06625, deliveryDays: 3 },
  { pincode: "07002", city: "Avenel", state: "NJ", zone: "East", salesTaxRate: 0.06625, deliveryDays: 3 },
  { pincode: "07102", city: "Newark", state: "NJ", zone: "East", salesTaxRate: 0.06625, deliveryDays: 3 },
  { pincode: "07103", city: "Newark", state: "NJ", zone: "East", salesTaxRate: 0.06625, deliveryDays: 3 },
  { pincode: "07104", city: "Newark", state: "NJ", zone: "East", salesTaxRate: 0.06625, deliveryDays: 3 },
  // Virginia
  { pincode: "20001", city: "Washington DC area", state: "VA", zone: "East", salesTaxRate: 0.053, deliveryDays: 3 },
  { pincode: "20002", city: "Washington DC area", state: "VA", zone: "East", salesTaxRate: 0.053, deliveryDays: 3 },
  { pincode: "20003", city: "Washington DC area", state: "VA", zone: "East", salesTaxRate: 0.053, deliveryDays: 3 },
  { pincode: "20004", city: "Washington DC area", state: "VA", zone: "East", salesTaxRate: 0.053, deliveryDays: 3 },
  { pincode: "23201", city: "Richmond", state: "VA", zone: "East", salesTaxRate: 0.053, deliveryDays: 4 },
  { pincode: "23219", city: "Richmond", state: "VA", zone: "East", salesTaxRate: 0.053, deliveryDays: 4 },
  // Maryland
  { pincode: "21201", city: "Baltimore", state: "MD", zone: "East", salesTaxRate: 0.06, deliveryDays: 3 },
  { pincode: "21202", city: "Baltimore", state: "MD", zone: "East", salesTaxRate: 0.06, deliveryDays: 3 },
  { pincode: "21203", city: "Baltimore", state: "MD", zone: "East", salesTaxRate: 0.06, deliveryDays: 3 },
  // Tennessee
  { pincode: "37201", city: "Nashville", state: "TN", zone: "Central", salesTaxRate: 0.0975, deliveryDays: 4 },
  { pincode: "37202", city: "Nashville", state: "TN", zone: "Central", salesTaxRate: 0.0975, deliveryDays: 4 },
  { pincode: "37203", city: "Nashville", state: "TN", zone: "Central", salesTaxRate: 0.0975, deliveryDays: 4 },
  { pincode: "38101", city: "Memphis", state: "TN", zone: "Central", salesTaxRate: 0.0975, deliveryDays: 4 },
  { pincode: "38103", city: "Memphis", state: "TN", zone: "Central", salesTaxRate: 0.0975, deliveryDays: 4 },
  // Louisiana
  { pincode: "70112", city: "New Orleans", state: "LA", zone: "Central", salesTaxRate: 0.0945, deliveryDays: 5 },
  { pincode: "70113", city: "New Orleans", state: "LA", zone: "Central", salesTaxRate: 0.0945, deliveryDays: 5 },
  // Missouri
  { pincode: "63101", city: "St. Louis", state: "MO", zone: "Central", salesTaxRate: 0.0866, deliveryDays: 4 },
  { pincode: "63102", city: "St. Louis", state: "MO", zone: "Central", salesTaxRate: 0.0866, deliveryDays: 4 },
  { pincode: "63103", city: "St. Louis", state: "MO", zone: "Central", salesTaxRate: 0.0866, deliveryDays: 4 },
  // Indiana
  { pincode: "46201", city: "Indianapolis", state: "IN", zone: "Central", salesTaxRate: 0.07, deliveryDays: 4 },
  { pincode: "46202", city: "Indianapolis", state: "IN", zone: "Central", salesTaxRate: 0.07, deliveryDays: 4 },
  // Wisconsin
  { pincode: "53201", city: "Milwaukee", state: "WI", zone: "Central", salesTaxRate: 0.056, deliveryDays: 4 },
  { pincode: "53202", city: "Milwaukee", state: "WI", zone: "Central", salesTaxRate: 0.056, deliveryDays: 4 },
  { pincode: "53204", city: "Milwaukee", state: "WI", zone: "Central", salesTaxRate: 0.056, deliveryDays: 4 },
  // Kentucky
  { pincode: "40201", city: "Louisville", state: "KY", zone: "Central", salesTaxRate: 0.06, deliveryDays: 4 },
  { pincode: "40202", city: "Louisville", state: "KY", zone: "Central", salesTaxRate: 0.06, deliveryDays: 4 },
  // Alabama
  { pincode: "35201", city: "Birmingham", state: "AL", zone: "East", salesTaxRate: 0.10, deliveryDays: 5 },
  { pincode: "35203", city: "Birmingham", state: "AL", zone: "East", salesTaxRate: 0.10, deliveryDays: 5 },
  // Oklahoma
  { pincode: "73101", city: "Oklahoma City", state: "OK", zone: "Central", salesTaxRate: 0.08987, deliveryDays: 5 },
  { pincode: "73102", city: "Oklahoma City", state: "OK", zone: "Central", salesTaxRate: 0.08987, deliveryDays: 5 },
  // Hawaii
  { pincode: "96801", city: "Honolulu", state: "HI", zone: "West", salesTaxRate: 0.04, deliveryDays: 10, isDeliverable: false },
  { pincode: "96815", city: "Honolulu", state: "HI", zone: "West", salesTaxRate: 0.04, deliveryDays: 10, isDeliverable: false },
  // Alaska
  { pincode: "99501", city: "Anchorage", state: "AK", zone: "West", salesTaxRate: 0, deliveryDays: 14, isDeliverable: false },
  { pincode: "99502", city: "Anchorage", state: "AK", zone: "West", salesTaxRate: 0, deliveryDays: 14, isDeliverable: false },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: "eco-pract" });
  console.log("Connected to MongoDB");
  for (const p of usPincodes) {
    await Pincode.findOneAndUpdate({ pincode: p.pincode }, { ...p, country: "US" }, { upsert: true, new: true });
    console.log(`✓ ${p.pincode} — ${p.city}, ${p.state}`);
  }
  console.log("\nPincode seeding complete!");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
