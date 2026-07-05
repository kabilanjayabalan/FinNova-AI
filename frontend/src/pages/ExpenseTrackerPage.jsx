import React, { useState, useMemo, useRef } from 'react';
import { PlusCircle, Trash2, TrendingUp, Receipt, FileText, ChevronDown, Filter, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];
const CAT_COLORS = { Food: '#EF4444', Transport: '#3B82F6', Entertainment: '#8B5CF6', Shopping: '#EC4899', Bills: '#F59E0B', Health: '#10B981', Education: '#06B6D4', Other: '#6B7280' };
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

const useExpenses = () => {
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('expense_tracker_data') || '[]'); } catch { return []; }
  });
  const save = (updated) => { setExpenses(updated); localStorage.setItem('expense_tracker_data', JSON.stringify(updated)); };
  const addExpense = (exp) => save([{ ...exp, id: Date.now().toString() }, ...expenses]);
  const deleteExpense = (id) => save(expenses.filter(e => e.id !== id));
  return { expenses, addExpense, deleteExpense };
};

// Add Expense Form
const AddExpenseForm = ({ onAdd }) => {
  const [form, setForm] = useState({ amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], description: '' });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) { toast.error('Enter valid amount'); return; }
    onAdd({ ...form, amount: Number(form.amount) });
    setForm({ amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], description: '' });
    toast.success('Expense added!');
  };
  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white";
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-blue-500" />Add Expense</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₹)</label>
          <input type="number" min="0" step="0.01" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className={inputClass}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
          <input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
          <input type="text" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="e.g., Lunch at cafe" className={inputClass} />
        </div>
      </div>
      <button type="submit" className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm">Add Expense</button>
    </form>
  );
};

// History Tab
const HistoryTab = ({ expenses, onDelete }) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const filtered = expenses.filter(e =>
    (catFilter === 'All' || e.category === catFilter) &&
    (e.description?.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
          <option>All</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><Receipt size={40} className="mx-auto mb-3 opacity-50"/><p>No expenses found</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Description</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="px-5 py-3.5"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(e=>(
                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-gray-600">{e.date}</td>
                  <td className="px-5 py-4 text-gray-800 font-medium">{e.description || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{background:CAT_COLORS[e.category]+'20',color:CAT_COLORS[e.category]}}>{e.category}</span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900">{fmt(e.amount)}</td>
                  <td className="px-5 py-4">
                    <button onClick={()=>onDelete(e.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Analytics Tab
const AnalyticsTab = ({ expenses }) => {
  const now = new Date();
  const thisMonth = expenses.filter(e => e.date.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`) );
  const total = expenses.reduce((s,e)=>s+e.amount,0);
  const totalMonth = thisMonth.reduce((s,e)=>s+e.amount,0);

  const byCat = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0),
    color: CAT_COLORS[cat]
  })).filter(c=>c.value>0).sort((a,b)=>b.value-a.value);

  const byMonth = Array.from({length:6}).map((_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    return { month: d.toLocaleString('default',{month:'short'}), total: expenses.filter(e=>e.date.startsWith(key)).reduce((s,e)=>s+e.amount,0) };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5"><p className="text-xs font-semibold text-blue-600 mb-1">Total This Month</p><p className="text-2xl font-bold text-blue-900">{fmt(totalMonth)}</p></div>
        <div className="bg-purple-50 rounded-2xl p-5"><p className="text-xs font-semibold text-purple-600 mb-1">Total All Time</p><p className="text-2xl font-bold text-purple-900">{fmt(total)}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Spending by Category</h3>
          {byCat.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={byCat} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                {byCat.map((c,i)=><Cell key={i} fill={c.color}/>)}
              </Pie><Tooltip formatter={v=>fmt(v)}/></PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byMonth}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="month" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}} tickFormatter={v=>fmt(v)}/><Tooltip formatter={v=>fmt(v)}/><Bar dataKey="total" fill="#3B82F6" radius={[6,6,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-3">Top Spending Categories</h3>
        <div className="space-y-3">{byCat.slice(0,3).map((c,i)=>(
          <div key={c.name} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{background:c.color}}>{i+1}</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1"><span className="text-sm font-semibold">{c.name}</span><span className="text-sm font-bold">{fmt(c.value)}</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{width:`${(c.value/byCat[0].value)*100}%`,background:c.color}}/></div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );
};

// Report Tab
const ReportTab = ({ expenses }) => {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (expenses.length === 0) { toast.error('Add some expenses first!'); return; }
    setLoading(true);
    const total = expenses.reduce((s,e)=>s+e.amount,0);
    const byCat = {};
    expenses.forEach(e=>{ byCat[e.category]=(byCat[e.category]||0)+e.amount; });
    const topCats = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}: ₹${v.toLocaleString('en-IN')}`).join(', ');
    const summary = `I have tracked ${expenses.length} expenses totaling ₹${total.toLocaleString('en-IN')}. Top categories: ${topCats}. Please analyze my spending habits and provide actionable financial advice to help me save more money and improve my financial health. Keep it concise and practical.`;
    try {
      const res = await api.post('/ai/chat', { message: summary, history: [] });
      const msg = res.data?.data?.message || res.data?.message || 'Unable to generate report.';
      setReport(msg);
    } catch (e) {
      setReport(`📊 Spending Analysis Report\n\nTotal Expenses: ₹${total.toLocaleString('en-IN')}\nTop Categories: ${topCats}\n\nRecommendation: Based on your spending, consider setting a monthly budget limit for your top categories. Try to save at least 20% of your income by reducing discretionary spending in Entertainment and Shopping categories.`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <FileText size={40} className="mx-auto mb-3 text-blue-400" />
        <h3 className="font-bold text-gray-900 mb-1">AI Spending Analysis Report</h3>
        <p className="text-sm text-gray-500 mb-5">Get personalized insights about your spending habits and saving tips.</p>
        <button onClick={generateReport} disabled={loading} className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm">
          {loading ? 'Analyzing...' : '✨ Generate AI Report'}
        </button>
      </div>
      {report && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Your Report</h3>
            <button onClick={()=>{navigator.clipboard.writeText(report);toast.success('Copied!');}} className="text-xs text-blue-600 hover:underline font-semibold">Copy</button>
          </div>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{report}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

const ExpenseTrackerPage = () => {
  const [tab, setTab] = useState('add');
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const tabs = [
    { id: 'add', label: 'Add Expense', icon: PlusCircle },
    { id: 'history', label: 'History', icon: Receipt, badge: expenses.length },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'report', label: 'AI Report', icon: FileText },
  ];
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
        <p className="text-gray-500 mt-1">Track, analyze, and optimize your spending.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 flex-wrap">
        {tabs.map(({id,label,icon:Icon,badge})=>(
          <button key={id} onClick={()=>setTab(id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${tab===id?'bg-blue-500 text-white shadow-sm':'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <Icon size={15}/>{label}{badge?<span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab===id?'bg-white/20 text-white':'bg-gray-100 text-gray-600'}`}>{badge}</span>:null}
          </button>
        ))}
      </div>
      <div>
        {tab==='add' && <AddExpenseForm onAdd={addExpense}/>}
        {tab==='history' && <HistoryTab expenses={expenses} onDelete={deleteExpense}/>}
        {tab==='analytics' && <AnalyticsTab expenses={expenses}/>}
        {tab==='report' && <ReportTab expenses={expenses}/>}
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;
