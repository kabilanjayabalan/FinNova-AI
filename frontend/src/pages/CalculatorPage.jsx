import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calculator, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

const InputField = ({ label, value, onChange, min = 0, max, step = 1, prefix }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${prefix ? 'pl-8 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

const ResultCard = ({ label, value, highlight }) => (
  <div className={`rounded-xl p-4 ${highlight ? 'bg-blue-500 text-white' : 'bg-gray-50'}`}>
    <p className={`text-xs font-semibold mb-1 ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>{label}</p>
    <p className={`text-xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
  </div>
);

const COLORS = ['#3B82F6', '#10B981'];

// SIP Tab
const SIPCalculator = () => {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const results = useMemo(() => {
    const n = years * 12;
    const r = rate / 12 / 100;
    const fv = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = monthly * n;
    const returns = fv - invested;
    return { invested, returns, fv };
  }, [monthly, rate, years]);

  const pieData = [{ name: 'Invested', value: results.invested }, { name: 'Returns', value: Math.max(0, results.returns) }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <InputField label="Monthly Investment" value={monthly} onChange={setMonthly} min={500} step={500} prefix="₹" />
        <InputField label="Expected Annual Return (%)" value={rate} onChange={setRate} min={1} max={30} step={0.5} />
        <InputField label="Duration (Years)" value={years} onChange={setYears} min={1} max={40} />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <ResultCard label="Total Amount Invested" value={fmt(results.invested)} />
          <ResultCard label="Estimated Returns" value={fmt(results.returns)} />
          <ResultCard label="Total Maturity Value" value={fmt(results.fv)} highlight />
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:COLORS[0]}}></span>Invested</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:COLORS[1]}}></span>Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// SWP Tab
const SWPCalculator = () => {
  const [corpus, setCorpus] = useState(1000000);
  const [withdrawal, setWithdrawal] = useState(10000);
  const [rate, setRate] = useState(8);

  const results = useMemo(() => {
    let remaining = corpus;
    let months = 0;
    let totalWithdrawn = 0;
    const monthlyRate = rate / 12 / 100;
    const maxMonths = 600; // 50 years max
    while (remaining > 0 && months < maxMonths) {
      remaining = remaining * (1 + monthlyRate) - withdrawal;
      totalWithdrawn += Math.min(withdrawal, remaining + withdrawal);
      months++;
    }
    return { months, years: Math.floor(months / 12), remMonths: months % 12, totalWithdrawn, exhausted: remaining <= 0 };
  }, [corpus, withdrawal, rate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <InputField label="Initial Investment" value={corpus} onChange={setCorpus} min={10000} step={10000} prefix="₹" />
        <InputField label="Monthly Withdrawal" value={withdrawal} onChange={setWithdrawal} min={500} step={500} prefix="₹" />
        <InputField label="Expected Annual Return (%)" value={rate} onChange={setRate} min={1} max={20} step={0.5} />
      </div>
      <div className="space-y-4">
        <ResultCard label="Total Months" value={`${results.months} months`} />
        <ResultCard label="Duration" value={`${results.years} years ${results.remMonths} months`} />
        <ResultCard label="Total Amount Withdrawn" value={fmt(results.totalWithdrawn)} highlight />
        {results.exhausted ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
            ⚠️ Corpus will be exhausted after {results.years} years {results.remMonths} months
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium">
            ✅ Corpus can sustain withdrawals for 50+ years
          </div>
        )}
      </div>
    </div>
  );
};

// Lumpsum Tab
const LumpsumCalculator = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const results = useMemo(() => {
    const fv = principal * Math.pow(1 + rate / 100, years);
    const returns = fv - principal;
    return { principal, returns, fv };
  }, [principal, rate, years]);

  const pieData = [{ name: 'Invested', value: results.principal }, { name: 'Returns', value: Math.max(0, results.returns) }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <InputField label="Investment Amount" value={principal} onChange={setPrincipal} min={1000} step={1000} prefix="₹" />
        <InputField label="Expected Annual Return (%)" value={rate} onChange={setRate} min={1} max={30} step={0.5} />
        <InputField label="Duration (Years)" value={years} onChange={setYears} min={1} max={40} />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <ResultCard label="Initial Investment" value={fmt(results.principal)} />
          <ResultCard label="Estimated Returns" value={fmt(results.returns)} />
          <ResultCard label="Total Maturity Value" value={fmt(results.fv)} highlight />
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:COLORS[0]}}></span>Invested</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:COLORS[1]}}></span>Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalculatorPage = () => {
  const [tab, setTab] = useState('sip');
  const tabs = [
    { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
    { id: 'swp', label: 'SWP Calculator', icon: RefreshCw },
    { id: 'lumpsum', label: 'Lumpsum', icon: DollarSign },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Calculator</h1>
        <p className="text-gray-500 mt-1">Plan your investments with SIP, SWP, and Lumpsum calculators.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              tab === id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {tab === 'sip' && <SIPCalculator />}
        {tab === 'swp' && <SWPCalculator />}
        {tab === 'lumpsum' && <LumpsumCalculator />}
      </div>
    </div>
  );
};

export default CalculatorPage;
