import React, { useState, useEffect } from 'react';
import { 
  QrCode, CheckCircle2, AlertCircle, Search, User, 
  Calendar, Clock, ShieldCheck, Loader2, Sparkles, Check
} from 'lucide-react';

export const AdminEventCheckInManager: React.FC = () => {
  const [ticketToken, setTicketToken] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('1');
  const [events, setEvents] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    already_checked_in?: boolean;
    attendee?: any;
    checked_in_at?: string;
  } | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Load events list for checkin dropdown
    fetch('/api/events')
      .then(r => r.json())
      .then(d => {
        if (d.events && Array.isArray(d.events)) {
          setEvents(d.events);
          if (d.events.length > 0) {
            setSelectedEventId(String(d.events[0]._id || d.events[0].id || '1'));
          }
        }
      })
      .catch(() => {});
  }, []);

  const fetchCheckins = async (eventId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/events/${eventId}/checkins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCheckins(data.checkins || []);
      }
    } catch (err) {
      console.error('Failed to load checkins:', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchCheckins(selectedEventId);
    }
  }, [selectedEventId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !ticketToken.trim()) return;

    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/events/${selectedEventId}/verify-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ticket_token: ticketToken.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyResult({
          success: true,
          message: data.message,
          attendee: data.attendee
        });
        setTicketToken('');
        fetchCheckins(selectedEventId);
      } else {
        setVerifyResult({
          success: false,
          already_checked_in: data.already_checked_in,
          message: data.message || data.error || 'Verification failed',
          attendee: data.attendee,
          checked_in_at: data.checked_in_at
        });
      }
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || 'Verification network error'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            Live Credentialing
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Event Admission Pass & QR Check-In Scanner
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
          Scan QR codes or enter ticket tokens at the lab entrance to verify attendee credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verification Scanner Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span>Verify Attendee Ticket</span>
            </h3>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1">
                Select Active Event
              </label>
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                {events.length > 0 ? (
                  events.map(ev => (
                    <option key={ev._id || ev.id} value={String(ev._id || ev.id)}>
                      {ev.title}
                    </option>
                  ))
                ) : (
                  <option value="1">JSTU Robotics Workshop 2026</option>
                )}
              </select>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Ticket Token / Scanned QR Payload
                </label>
                <input
                  type="text"
                  placeholder="e.g. jstu:evt:1:usr:7:..."
                  value={ticketToken}
                  onChange={e => setTicketToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !ticketToken.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Admission...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Check In</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification Result Banner */}
            {verifyResult && (
              <div className={`p-4 rounded-xl text-xs space-y-1.5 ${
                verifyResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                  : verifyResult.already_checked_in
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {verifyResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                  <span>{verifyResult.message}</span>
                </div>
                {verifyResult.attendee?.name && (
                  <p className="font-mono">Attendee: {verifyResult.attendee.name}</p>
                )}
                {verifyResult.checked_in_at && (
                  <p className="text-[10px] font-mono opacity-80">Checked in at: {new Date(verifyResult.checked_in_at).toLocaleTimeString()}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Attendance Log */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Verified Attendance Roster ({checkins.length})</span>
              </h3>
              <button
                onClick={() => fetchCheckins(selectedEventId)}
                className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Refresh
              </button>
            </div>

            {checkins.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                No checked-in attendees recorded for this event yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {checkins.map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{c.user_name}</h4>
                        <p className="text-[11px] font-mono text-slate-500">{c.department || c.email || 'Member'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(c.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
