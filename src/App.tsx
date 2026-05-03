import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Notices from './pages/Notices';
import Documents from './pages/Documents';
import RFPs from './pages/RFPs';
import Financials from './pages/Financials';
import MeetingMinutes from './pages/MeetingMinutes';
import ServiceTickets from './pages/ServiceTickets';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Chatbot from './components/Chatbot';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/rfps" element={<RFPs />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/minutes" element={<MeetingMinutes />} />
          <Route path="/service-tickets" element={<ServiceTickets />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
      <Chatbot />
    </Router>
  );
}
