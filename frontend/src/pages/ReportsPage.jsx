import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Search, Settings, TrendingUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

/* ── AI analysis error detection ───────────────────────────────── */
const isAiError = (text) => {
  if (!text) return false;
  const t = text.trim();
  return (
    t.startsWith('{') ||
    t.toLowerCase().includes('api key') ||
    t.toLowerCase().includes('api_key') ||
    t.toLowerCase().includes('quota exceeded') ||
    t.toLowerCase().includes('invalid key') ||
    t.toLowerCase().includes('permission denied') ||
    t.toLowerCase().includes('googleapis')
  );
};

/* ── Recommendation badge ───────────────────────────────────────── */
const RecoBadge = ({ rec }) => {
  const styles = {
    BUY: 'bg-green-50 text-green-700 border-green-100',
    SELL: 'bg-red-50 text-red-700 border-red-100',
    HOLD: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[rec] || styles.HOLD}`}>
      {rec}
    </span>
  );
};

/* ── Report Card ────────────────────────────────────────────────── */
const ReportCard = ({ report }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const analysisText = report.aiAnalysis || report.content || '';
  const hasError = isAiError(analysisText);

  const handleExport = (e) => {
    e.stopPropagation();
    try {
      const doc = new jsPDF();
      const margin = 15;
      let y = 20;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(report.title || `${report.ticker} Analysis Report`, margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${report.generatedAt ? format(new Date(report.generatedAt), 'MMM dd, yyyy') : 'Recent'}`, margin, y);
      y += 10;

      if (report.recommendation) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Recommendation: ${report.recommendation}`, margin, y);
        y += 10;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const splitText = doc.splitTextToSize(analysisText, doc.internal.pageSize.getWidth() - margin * 2);
      
      // Page break logic
      const pageHeight = doc.internal.pageSize.getHeight();
      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(splitText[i], margin, y);
        y += 6; // line height
      }

      doc.save(`${report.ticker}_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('Report exported to PDF successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF.');
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Ticker badge — fixed size, truncates if too long */}
            <div className="min-w-[48px] max-w-[48px] h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="text-primary font-bold text-xs text-center leading-tight truncate px-1">
                {report.ticker || 'N/A'}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate">
                {report.title || `${report.ticker} Analysis Report`}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar size={13} />
                <span>
                  {report.generatedAt
                    ? format(new Date(report.generatedAt), 'MMM dd, yyyy')
                    : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
            title="Export as PDF"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {report.recommendation && <RecoBadge rec={report.recommendation} />}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            AI Generated
          </span>
        </div>

        {/* Preview text */}
        {!expanded && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {hasError
              ? 'AI analysis unavailable — please configure your Google API key in Settings.'
              : (analysisText || 'Click to view full analysis report.')}
          </p>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            {hasError ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Settings size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">AI Analysis Unavailable</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Please configure your Google API key to enable AI analysis.
                    </p>
                    <Link
                      to="/settings#api-keys"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:underline font-semibold"
                    >
                      <Settings size={14} />
                      Configure API Key in Settings
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {analysisText || 'No detailed analysis available.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Reports Page ───────────────────────────────────────────────── */
const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/ai/history?type=STOCK_ANALYSIS');
        if (res.data?.success && res.data.data?.content?.length > 0) {
          const mapped = res.data.data.content.map((q) => ({
            id: q.id,
            ticker: q.ticker || 'UNKNOWN',
            title: `${q.ticker || 'Stock'} Research Report`,
            aiAnalysis: q.response,
            generatedAt: q.createdAt,
            recommendation:
              q.response?.includes('BUY')
                ? 'BUY'
                : q.response?.includes('SELL')
                ? 'SELL'
                : 'HOLD',
          }));
          setReports(mapped);
        } else {
          setReports([]);
        }
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    (r) =>
      r.ticker?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader fullPage />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Reports</h1>
          <p className="text-gray-500 mt-1">Your AI-generated stock research and portfolio analyses</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Report list */}
      {filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        /* Clean empty state */
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText size={32} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {search ? 'No reports match your search' : 'No reports yet'}
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
            {search
              ? `No reports found for "${search}". Try a different ticker or title.`
              : "You haven't generated any AI research reports yet. Start by running a stock analysis."}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/research')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <TrendingUp size={16} />
              Run Research
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
