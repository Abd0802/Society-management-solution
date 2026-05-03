import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

const SAMPLE_DOCS = [
  { name: 'Society Bye-Laws 2024', category: 'Constitutional', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { name: 'Fire Safety Certificate', category: 'Compliance', url: 'https://www.africau.edu/images/default/sample.pdf' },
  { name: 'Water Audit Report', category: 'Compliance', url: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf' },
  { name: 'Security Agency Agreement', category: 'Agreements', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
];

const SAMPLE_NOTICES = [
  { title: 'Water Tank Cleaning Schedule', content: 'The overhead water tanks will be cleaned this Sunday from 10 AM to 4 PM. Please store water in advance.', urgency: 'High', date: serverTimestamp() },
  { title: 'Republic Day Celebration', content: 'Join us for the flag hoisting ceremony at 8:30 AM in the main garden area.', urgency: 'Low', date: serverTimestamp() },
  { title: 'Lift Maintenance', content: 'Lift A will be shut down for routine maintenance on Tuesday between 1 PM and 3 PM.', urgency: 'Medium', date: serverTimestamp() }
];

const SAMPLE_TICKETS = [
  { ticketId: 'TKT-001', name: 'John Doe', flatNumber: 'A-402', email: 'john@example.com', mobileNumber: '9876543210', type: 'Plumbing', description: 'Leaking pipe in the kitchen area.', preferredDate: '2026-05-10', status: 'Open', createdAt: serverTimestamp(), paymentScreenshotUrl: 'https://imgur.com/gallery/payment-receipt-placeholder-yvVvO' },
  { ticketId: 'TKT-002', name: 'Sara Khan', flatNumber: 'B-101', email: 'sara@example.com', mobileNumber: '9876543211', type: 'Electrical', description: 'Corridor lights are flickering since last night.', preferredDate: '2026-05-12', status: 'In Progress', createdAt: serverTimestamp(), paymentScreenshotUrl: 'https://imgur.com/gallery/payment-receipt-placeholder-yvVvO' },
  { ticketId: 'TKT-003', name: 'Amit Singh', flatNumber: 'C-704', email: 'amit@example.com', mobileNumber: '9876543212', type: 'Security', description: 'Requesting extra keycard for a new tenant.', preferredDate: '2026-05-05', status: 'Closed', createdAt: serverTimestamp(), paymentScreenshotUrl: 'https://imgur.com/gallery/payment-receipt-placeholder-yvVvO' },
  { ticketId: 'TKT-004', name: 'Rita Verma', flatNumber: 'D-203', email: 'rita@example.com', mobileNumber: '9876543213', type: 'Cleaning', description: 'Common area stairs need deep cleaning after construction work.', preferredDate: '2026-05-08', status: 'Open', createdAt: serverTimestamp(), paymentScreenshotUrl: 'https://imgur.com/gallery/payment-receipt-placeholder-yvVvO' },
  { ticketId: 'TKT-005', name: 'Kiran Rao', flatNumber: 'B-505', email: 'kiran@example.com', mobileNumber: '9876543214', type: 'General', description: 'Parking space line needs repainting.', preferredDate: '2026-05-15', status: 'Open', createdAt: serverTimestamp(), paymentScreenshotUrl: 'https://imgur.com/gallery/payment-receipt-placeholder-yvVvO' }
];

const SAMPLE_FINANCIALS = [
  { month: 'March 2026', income: '₹14,50,000', expenditure: '₹11,20,000', reportUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', createdAt: serverTimestamp() },
  { month: 'February 2026', income: '₹13,80,000', expenditure: '₹10,50,000', reportUrl: 'https://www.africau.edu/images/default/sample.pdf', createdAt: serverTimestamp() }
];

const SAMPLE_MINUTES = [
  { date: '2026-04-15', title: 'Monthly Committee Meeting - April', url: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', createdAt: serverTimestamp() },
  { date: '2026-03-10', title: 'Annual General Body Meeting (AGM) 2026', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', createdAt: serverTimestamp() }
];

export async function seedDemoData() {
  const collections = ['documents', 'notices', 'tickets', 'financials', 'minutes'];
  
  // Basic check to see if we already have data to avoid excessive duplicates during demo
  const q = query(collection(db, 'documents'), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
     if (!confirm("Data already exists. Do you want to add more sample records?")) return;
  }

  try {
    for (const doc of SAMPLE_DOCS) await addDoc(collection(db, 'documents'), doc);
    for (const notice of SAMPLE_NOTICES) await addDoc(collection(db, 'notices'), notice);
    for (const ticket of SAMPLE_TICKETS) await addDoc(collection(db, 'tickets'), ticket);
    for (const fin of SAMPLE_FINANCIALS) await addDoc(collection(db, 'financials'), fin);
    for (const min of SAMPLE_MINUTES) await addDoc(collection(db, 'minutes'), min);
    
    alert("Demo data seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    alert("Error seeding data. Check console for details.");
  }
}
