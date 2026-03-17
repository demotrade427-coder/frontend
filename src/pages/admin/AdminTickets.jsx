import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/tickets');
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-slate-400 mt-1">View and manage support requests</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">User</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Subject</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-500">No tickets found</td>
                  </tr>
                ) : (
                  tickets.map((ticket, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 text-white font-medium">{ticket.first_name || 'User'}</td>
                      <td className="px-4 py-4 text-slate-300">{ticket.subject || ticket.title || 'No subject'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' :
                          ticket.status === 'closed' ? 'bg-slate-500/20 text-slate-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400 text-sm">{formatDate(ticket.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
