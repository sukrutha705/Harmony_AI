import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBRDwH0a7dZNk4rnRXfUD3HPsnslz_EK8",
  authDomain: "harmony-ai-b9bb3.firebaseapp.com",
  projectId: "harmony-ai-b9bb3",
  storageBucket: "harmony-ai-b9bb3.firebasestorage.app",
  messagingSenderId: "76949891716",
  appId: "1:76949891716:web:c894962667fa74d3b9f0d1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockReports = [
  {
    title: "Traffic Signal Failure at MG Road",
    description: "The main traffic signal is completely out, causing severe congestion and risk of accidents. Need immediate traffic police assistance.",
    category: "Traffic Hazard",
    priority: "High",
    location_label: "MG Road Junction, Bangalore",
    location: { lat: 12.9716, lng: 77.6013 },
    createdAt: new Date().toISOString(),
    status: "pending",
    displayId: "REP-MG-01"
  },
  {
    title: "Stray Dogs Aggressive Behavior",
    description: "A pack of stray dogs is aggressively chasing two-wheelers and pedestrians near the park.",
    category: "Public Safety",
    priority: "Medium",
    location_label: "Cubbon Park, Bangalore",
    location: { lat: 12.9779, lng: 77.5952 },
    createdAt: new Date().toISOString(),
    status: "in_progress",
    displayId: "REP-CP-02"
  },
  {
    title: "Broken Streetlight",
    description: "Streetlight has been broken for 3 days making the street completely dark and unsafe for walking at night.",
    category: "Infrastructure Safety",
    priority: "Low",
    location_label: "Indiranagar 100ft Road, Bangalore",
    location: { lat: 12.9784, lng: 77.6408 },
    createdAt: new Date().toISOString(),
    status: "pending",
    displayId: "REP-IN-03"
  },
  {
    title: "Fire Hazard: Garbage Burning",
    description: "Large pile of garbage being burnt near residential complex, causing severe breathing issues.",
    category: "Fire Hazard",
    priority: "High",
    location_label: "Koramangala 4th Block, Bangalore",
    location: { lat: 12.9345, lng: 77.6266 },
    createdAt: new Date().toISOString(),
    status: "pending",
    displayId: "REP-KM-04"
  }
];

async function seedData() {
  console.log("Adding mock reports to Firestore...");
  for (const report of mockReports) {
    try {
      await addDoc(collection(db, "reports"), report);
      console.log(`✅ Added: ${report.title}`);
    } catch (e) {
      console.error(`❌ Error adding document: `, e);
    }
  }
  console.log("Mock data seeding complete! You can press Ctrl+C to exit.");
  process.exit(0);
}

seedData();
