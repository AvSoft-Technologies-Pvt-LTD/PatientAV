import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import * as Lucide from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Emergency = () => {
  const [step, setStep] = useState(0), [type, setType] = useState(''), [cat, setCat] = useState(''), [equip, setEquip] = useState([]), [date, setDate] = useState(new Date()), [pickup, setPickup] = useState(''), [month, setMonth] = useState(new Date()), [showCal, setShowCal] = useState(false), [data, setData] = useState(null), [calPos, setCalPos] = useState('bottom'), [showEquip, setShowEquip] = useState(false);
  const equipRef = useRef(null), dateRef = useRef(null);
  useEffect(() => { axios.get('https://mocki.io/v1/8dc5d542-0deb-4f62-a6dd-66dc06b749ad').then(r => setData(r.data)).catch(() => toast.error('Failed to fetch data')); }, []);
  useEffect(() => { if (showEquip) { const h = e => { if (equipRef.current && !equipRef.current.contains(e.target)) setShowEquip(false); }; window.addEventListener('mousedown', h); return () => window.removeEventListener('mousedown', h); } }, [showEquip]);
  useEffect(() => { if (showCal && dateRef.current) { const r = dateRef.current.getBoundingClientRect(), h = 340, b = window.innerHeight - r.bottom, a = r.top; setCalPos(b < h && a > h ? 'top' : 'bottom'); } }, [showCal]);
  const getIcon = (n, s = 20) => { const I = { Activity: Lucide.Activity, Ambulance: Lucide.Ambulance, Heart: Lucide.Heart, HeartPulse: Lucide.HeartPulse, Cylinder: Lucide.Cylinder, Bed: Lucide.Bed, Lungs: Lucide.Settings, Wheelchair: Lucide.Armchair, ActivitySquare: Lucide.ActivitySquare, Zap: Lucide.Zap }; const C = I[n] || Lucide.Activity; return <C size={s} />; };
  const handleSubmit = async () => { try { await axios.post('https://mocki.io/v1/8dc5d542-0deb-4f62-a6dd-66dc06b749ad', { ambulanceType: type, category: cat, equipment: equip, pickupLocation: pickup, dropLocation: '', date: format(date, 'yyyy-MM-dd') }); toast('Connecting....', { className: 'Toastify__toast--connecting' }); } catch { toast('Connecting....', { className: 'Toastify__toast--connecting' }); } };
  const renderCal = () => { const ms = startOfMonth(month), me = endOfMonth(month), days = eachDayOfInterval({ start: ms, end: me }), w = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; return (<div className="relative top-full left-0 mt-1 bg-[var(--color-surface)] shadow-lg rounded-lg p-4 z-[1000] w-[300px]"><div className="flex justify-between items-center mb-4"><button onClick={() => setMonth(p => addDays(p, -30))} className="p-1 hover:bg-[var(--accent-color)]/10 rounded"><Lucide.ChevronLeft size={20} /></button><span className="font-medium">{format(month, 'MMMM yyyy')}</span><button onClick={() => setMonth(p => addDays(p, 30))} className="p-1 hover:bg-[var(--accent-color)]/10 rounded"><Lucide.ChevronRight size={20} /></button></div><div className="grid grid-cols-7 gap-1">{w.map(d => (<div key={d} className="text-center text-sm font-medium text-[var(--color-overlay)] py-1">{d}</div>))}{days.map(d => (<button key={d.toString()} onClick={() => { setDate(d); setShowCal(false); }} className={`p-2 text-sm rounded hover:bg-[var(--accent-color)]/10 ${isSameDay(d, date) ? 'bg-[var(--accent-color)] text-white' : ''}`}>{format(d, 'd')}</button>))}</div><button onClick={() => { setDate(new Date()); setShowCal(false); }} className="mt-2 w-full py-1 text-sm text-[var(--color-overlay)] hover:bg-[var(--accent-color)]/10 rounded">Today</button></div>); };
  const renderStep = () => !data ? <div className="text-center py-10 text-gray-400">Loading...</div> : step === 0 ? (<div className="w-full space-y-6">{/* Ambulance Type & Category */}<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{['ambulanceTypes', 'categories'].map((k, i) => (<div key={k} className="w-full min-w-[250px]"><label className="paragraph text-sm mb-3 block">{`Select ${i ? 'Category' : 'Ambulance Type'}`}</label><select value={i ? cat : type} onChange={e => (i ? setCat : setType)(e.target.value)} className="input-field w-full"><option value="">{`Select ${i ? 'category' : 'ambulance type'}`}</option>{data[k].map(o => (<option key={o.id} value={o.id}>{o.name}</option>))}</select>{(i ? cat : type) && (<div className="mt-2 p-3 border rounded-lg bg-[var(--accent-color)]/10 flex items-center gap-3"><div className="p-2 rounded-full bg-[var(--accent-color)]/20 text-[var(--primary-color)]">{getIcon(data[k].find(o => o.id === (i ? cat : type))?.icon)}</div><div><h4 className="paragraph">{data[k].find(o => o.id === (i ? cat : type))?.name}</h4><p className="paragraph text-sm">{data[k].find(o => o.id === (i ? cat : type))?.description}</p></div></div>)}</div>))}</div>
    {/* Equipment & Pickup */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="w-full min-w-[250px] relative" ref={equipRef}>
        <label className="paragraph text-sm mb-3 block">Select Equipment Requirements</label>
        <button type="button" className="input-field w-full mb-2 flex justify-between items-center" onClick={() => setShowEquip(p => !p)}>
          <span>{equip.length === 0 ? "Select equipment" : data.equipment.filter(e => equip.includes(e.id)).map(e => e.name).join(", ")}</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showEquip && (<div className="absolute z-20 mt-1 w-full bg-[var(--color-surface)] border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">{data.equipment.map(item => (<label key={item.id} className="flex items-center px-3 py-2 cursor-pointer hover:bg-[var(--accent-color)]/10"><input type="checkbox" checked={equip.includes(item.id)} onChange={() => setEquip(p => p.includes(item.id) ? p.filter(id => id !== item.id) : [...p, item.id])} className="mr-2 accent-[var(--accent-color)]" /><span className="flex items-center gap-2">{getIcon(item.icon, 16)}<span>{item.name}</span></span></label>))}</div>)}
        {equip.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{equip.map(eqId => { const e = data.equipment.find(e => e.id === eqId); return e ? (<div key={eqId} className="bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-3 py-1 rounded-full text-xs flex items-center gap-2">{getIcon(e.icon, 14)}<span>{e.name}</span></div>) : null; })}</div>)}
      </div>
      <div className="w-full min-w-[250px]">
        <label className="paragraph text-sm mb-3 block">Pickup Location</label>
        <select value={pickup} onChange={e => setPickup(e.target.value)} className="input-field w-full">
          <option value="">Select pickup location</option>
          {data.locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
        </select>
      </div>
    </div>
    {/* Date */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="w-full min-w-[250px]">
        <label className="paragraph text-sm mb-3 block">Select Date</label>
        <div className="relative w-full" ref={dateRef}>
          <div className="input-field w-full border rounded-md p-2 cursor-pointer flex items-center justify-between" onClick={() => setShowCal(!showCal)}>
            <span>{format(date, 'dd/MM/yyyy')}</span>
            <Lucide.ChevronRight size={20} />
          </div>
          {showCal && renderCal()}
        </div>
      </div>
    </div>
  </div>) : (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">Ambulance Details</h4><div className="grid grid-cols-2 gap-y-3 text-sm"><div className="text-gray-500">Type</div><div className="text-gray-800 font-medium">{data.ambulanceTypes.find(t => t.id === type)?.name}</div><div className="text-gray-500">Category</div><div className="text-gray-800 font-medium">{data.categories.find(c => c.id === cat)?.name}</div></div></div>
        <div><h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">Equipment</h4>{equip.length > 0 ? (<div className="flex flex-wrap gap-2">{equip.map(eqId => { const e = data.equipment.find(e => e.id === eqId); return e ? (<span key={eqId} className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">{getIcon(e.icon, 16)}{e.name}</span>) : null; })}</div>) : (<p className="text-sm text-gray-500">No equipment selected</p>)}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">Location</h4><div className="grid grid-cols-2 gap-y-3 text-sm"><div className="text-gray-500">Pickup</div><div className="text-gray-800 font-medium">{data.locations.find(l => l.id === pickup)?.name}</div></div></div>
        <div><h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">Schedule</h4><div className="grid grid-cols-2 gap-y-3 text-sm"><div className="text-gray-500">Date</div><div className="text-gray-800 font-medium">{format(date, 'dd/MM/yyyy')}</div></div></div>
      </div>
    </div>
  );
  return (
    <div className="w-full min-h-screen bg-[var(--color-surface)] py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="mx-auto bg-[var(--color-surface)] rounded-xl shadow-lg overflow-hidden">
        <div className="sub-heading px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Lucide.Ambulance className="card-icon-white" size={24} />
            <div>
              <h1 className="mt-4 text-lg mb-0 text-white">Ambulance Booking</h1>
              <p className="paragraph text-xs mb-0">Book an ambulance from AV Swasthya's trusted network</p>
            </div>
          </div>
          <button onClick={() => toast('Connecting....', { className: 'Toastify__toast--connecting' })} className="delete-btn px-9 "><span className="hidden sm:inline">Emergency</span></button>
        </div>
        <div className="px-6 py-4 border-b border-[var(--color-overlay)]">
          <div className="flex justify-center items-center w-full">
            {['Details', 'Confirm'].map((s, i) => (<div key={i} className="flex flex-col items-center" style={{ width: '50%' }}><div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${step === i ? 'bg-[var(--primary-color)] text-[var(--color-surface)]' : step > i ? 'bg-[var(--accent-color)] text-[var(--color-surface)]' : 'bg-[var(--color-surface)] text-[var(--color-overlay)] border border-[var(--color-overlay)]'}`}>{step > i ? <Lucide.CheckCircle2 size={20} /> : <span>{i + 1}</span>}</div><p className={`text-xs ${step === i || step > i ? 'text-[var(--primary-color)] font-medium' : 'text-[var(--color-overlay)]'}`}>{s}</p></div>))}
          </div>
        </div>
        <div className="px-6 py-6">{renderStep()}</div>
        <div className="px-6 py-4 bg-[var(--color-surface)] border-t border-[var(--color-overlay)] flex justify-between">
          {step > 0 && (<button onClick={() => setStep(p => p - 1)} className="btn btn-secondary">Back</button>)}
          <button onClick={() => { if (step === 1) handleSubmit(); else setStep(p => p + 1); }} className={`btn btn-primary ${step === 0 ? 'ml-auto' : ''}`}>{step === 1 ? 'Submit' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
};
export default Emergency;