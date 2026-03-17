import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-premium-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
