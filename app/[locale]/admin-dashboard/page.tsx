'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Building2,
  LogOut,
  RefreshCw,
  BarChart3,
  Star,
  Download,
  Globe,
  Clock,
  MousePointerClick,
  Eye
} from 'lucide-react';

interface Stats {
  waitlist: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byLocale: { hu: number; de: number };
  };
  audit: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    averageTrustScore: number;
    byLocale: { hu: number; de: number };
  };
  entries: {
    waitlist: Array<{
      id: string;
      email: string;
      hotelName: string;
      createdAt: string;
      locale: string;
    }>;
    audit: Array<{
      id: string;
      email: string;
      hotelName: string;
      hotelPlaceId: string | null;
      trustScore: number;
      aiVisibility: {
        chatgpt: { visible: boolean; position: number | null };
        gemini: { visible: boolean; position: number | null };
        bing: { visible: boolean; position: number | null };
      };
      unansweredReviews: number | string;
      totalReviews?: number;
      answeredReviews?: number;
      criticalIssues: string[];
      recommendations: string[];
      revenueLoss: string;
      createdAt: string;
      locale: string;
    }>;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'reports' | 'analytics'>('reports');
  const [activeTab, setActiveTab] = useState<'waitlist' | 'audit'>('waitlist');

  useEffect(() => {
    fetchStats();
    if (activeMainTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeMainTab]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      } else {
        if (response.status === 401) {
          router.push(`/${locale}/admin`);
        } else {
          setError(data.error || 'Hiba történt az adatok lekérése során');
        }
      }
    } catch (error) {
      setError('Hiba történt az adatok lekérése során');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();

      if (response.ok) {
        setAnalyticsStats(data.data);
      } else {
        if (response.status === 401) {
          router.push(`/${locale}/admin`);
        }
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      router.push(`/${locale}/admin`);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Replace commas and newlines, wrap in quotes if contains comma, newline, or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportToCSV = () => {
    if (!stats) return;

    const entries = activeTab === 'waitlist' ? stats.entries.waitlist : stats.entries.audit;
    
    if (entries.length === 0) {
      alert('Nincsenek exportálható adatok');
      return;
    }

    let csvContent = '';
    
    if (activeTab === 'waitlist') {
      // CSV header for waitlist - strukturált oszlopok
      csvContent = 'ID,Dátum,Email,Hotel Név,Nyelv\n';
      
      // CSV rows
      const waitlistEntries = stats.entries.waitlist;
      waitlistEntries.forEach((entry) => {
        const date = formatDate(entry.createdAt);
        csvContent += `${escapeCSV(entry.id)},${escapeCSV(date)},${escapeCSV(entry.email)},${escapeCSV(entry.hotelName)},${escapeCSV(entry.locale.toUpperCase())}\n`;
      });
    } else {
      // CSV header for audit - teljes strukturált adatok oszloponként
      csvContent = 'ID,Dátum,Email,Hotel Név,Hotel Place ID,Trust Score,Összes Vélemény,Válaszolt Vélemények,Válaszolatlan Vélemények,ChatGPT Látható,ChatGPT Pozíció,Gemini Látható,Gemini Pozíció,Bing Látható,Bing Pozíció,Bevételkiesés (%),Kritikus Hibák,Javaslatok,Nyelv\n';
      
      // CSV rows
      const auditEntries = stats.entries.audit;
      auditEntries.forEach((entry) => {
        const date = formatDate(entry.createdAt);
        const chatgptVisible = entry.aiVisibility.chatgpt.visible ? 'Igen' : 'Nem';
        const chatgptPosition = entry.aiVisibility.chatgpt.position || '';
        const geminiVisible = entry.aiVisibility.gemini.visible ? 'Igen' : 'Nem';
        const geminiPosition = entry.aiVisibility.gemini.position || '';
        const bingVisible = entry.aiVisibility.bing.visible ? 'Igen' : 'Nem';
        const bingPosition = entry.aiVisibility.bing.position || '';
        const criticalIssues = entry.criticalIssues.join(' | ');
        const recommendations = entry.recommendations.join(' | ');
        
        csvContent += `${escapeCSV(entry.id)},${escapeCSV(date)},${escapeCSV(entry.email)},${escapeCSV(entry.hotelName)},${escapeCSV(entry.hotelPlaceId || '')},${escapeCSV(entry.trustScore)},${escapeCSV(entry.totalReviews || '')},${escapeCSV(entry.answeredReviews || '')},${escapeCSV(entry.unansweredReviews)},${escapeCSV(chatgptVisible)},${escapeCSV(chatgptPosition)},${escapeCSV(geminiVisible)},${escapeCSV(geminiPosition)},${escapeCSV(bingVisible)},${escapeCSV(bingPosition)},${escapeCSV(entry.revenueLoss)},${escapeCSV(criticalIssues)},${escapeCSV(recommendations)},${escapeCSV(entry.locale.toUpperCase())}\n`;
      });
    }

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = activeTab === 'waitlist' 
      ? `varolista-export-${timestamp}.csv`
      : `audit-export-${timestamp}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && activeMainTab === 'reports') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/60">Adatok betöltése...</p>
        </div>
      </div>
    );
  }

  if (error && !stats && activeMainTab === 'reports') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/${locale}/admin`)}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Vissza a bejelentkezéshez
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-foreground/60">HotelTrust.ai Statisztikák</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchStats}
                className="p-2 hover:bg-background rounded-lg transition-colors"
                title="Frissítés"
              >
                <RefreshCw className="w-5 h-5 text-foreground/60" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-foreground/60 hover:text-foreground transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Kijelentkezés
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveMainTab('reports')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeMainTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              Jelentések
            </button>
            <button
              onClick={() => {
                setActiveMainTab('analytics');
                if (!analyticsStats) {
                  fetchAnalytics();
                }
              }}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeMainTab === 'analytics'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              Statisztikák
            </button>
          </div>
        </div>

        {/* Reports Tab Content */}
        {activeMainTab === 'reports' && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Waitlist Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">{stats.waitlist.total}</span>
            </div>
            <p className="text-sm font-medium text-foreground">Várólista Regisztrációk</p>
            <p className="text-xs text-foreground/60 mt-1">Összesen</p>
          </motion.div>

          {/* Audit Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-foreground">{stats.audit.total}</span>
            </div>
            <p className="text-sm font-medium text-foreground">Audit Kérések</p>
            <p className="text-xs text-foreground/60 mt-1">Összesen</p>
          </motion.div>

          {/* Average Trust Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-2xl font-bold text-foreground">{stats.audit.averageTrustScore}</span>
            </div>
            <p className="text-sm font-medium text-foreground">Átlagos Trust Score</p>
            <p className="text-xs text-foreground/60 mt-1">Auditok alapján</p>
          </motion.div>

          {/* Today's Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                {stats.waitlist.today + stats.audit.today}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">Mai Aktivitás</p>
            <p className="text-xs text-foreground/60 mt-1">Regisztrációk + Auditok</p>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Waitlist Stats */}
          <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Várólista Statisztikák
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ma</span>
                <span className="font-semibold text-foreground">{stats.waitlist.today}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ez a hét</span>
                <span className="font-semibold text-foreground">{stats.waitlist.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ez a hónap</span>
                <span className="font-semibold text-foreground">{stats.waitlist.thisMonth}</span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground/60">Magyar</span>
                  <span className="font-semibold text-foreground">{stats.waitlist.byLocale.hu}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/60">Német</span>
                  <span className="font-semibold text-foreground">{stats.waitlist.byLocale.de}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Stats */}
          <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Audit Statisztikák
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ma</span>
                <span className="font-semibold text-foreground">{stats.audit.today}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ez a hét</span>
                <span className="font-semibold text-foreground">{stats.audit.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground/60">Ez a hónap</span>
                <span className="font-semibold text-foreground">{stats.audit.thisMonth}</span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground/60">Magyar</span>
                  <span className="font-semibold text-foreground">{stats.audit.byLocale.hu}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/60">Német</span>
                  <span className="font-semibold text-foreground">{stats.audit.byLocale.de}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-lg border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Részletes Adatok
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('waitlist')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'waitlist'
                      ? 'bg-primary text-white'
                      : 'bg-background text-foreground/60 hover:bg-background/80'
                  }`}
                >
                  Várólista ({stats.entries.waitlist.length})
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'audit'
                      ? 'bg-primary text-white'
                      : 'bg-background text-foreground/60 hover:bg-background/80'
                  }`}
                >
                  Auditok ({stats.entries.audit.length})
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={!stats || (activeTab === 'waitlist' ? stats.entries.waitlist.length === 0 : stats.entries.audit.length === 0)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV Export
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'waitlist' ? (
              <div className="space-y-4">
                {stats.entries.waitlist.length === 0 ? (
                  <p className="text-center text-foreground/60 py-8">Még nincsenek várólista regisztrációk</p>
                ) : (
                  <div className="overflow-x-auto -mx-6 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-background">
                            <tr>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Dátum</th>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Email</th>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Hotel Név</th>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Nyelv</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-border/50">
                            {stats.entries.waitlist.map((entry) => (
                              <tr key={entry.id} className="hover:bg-background/50 transition-colors">
                                <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-sm text-foreground/80">{formatDate(entry.createdAt)}</td>
                                <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-sm text-foreground/80">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                                    <span className="truncate max-w-[200px] sm:max-w-none">{entry.email}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 sm:px-4 text-sm text-foreground/80">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                                    <span className="truncate max-w-[150px] sm:max-w-none">{entry.hotelName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-sm text-foreground/80">
                                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                                    {entry.locale.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {stats.entries.audit.length === 0 ? (
                  <p className="text-center text-foreground/60 py-8">Még nincsenek audit kérések</p>
                ) : (
                  <div className="overflow-x-auto -mx-6 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-background">
                            <tr>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Dátum</th>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Email</th>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Hotel Név</th>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Trust Score</th>
                              <th scope="col" className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">Nyelv</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-border/50">
                            {stats.entries.audit.map((entry) => (
                              <tr key={entry.id} className="hover:bg-background/50 transition-colors">
                                <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-sm text-foreground/80">{formatDate(entry.createdAt)}</td>
                                <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-sm text-foreground/80">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                                    <span className="truncate max-w-[200px] sm:max-w-none">{entry.email}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 sm:px-4 text-sm text-foreground/80">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                                    <span className="truncate max-w-[150px] sm:max-w-none">{entry.hotelName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-sm text-foreground/80">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    entry.trustScore >= 70 
                                      ? 'bg-green-500/10 text-green-600' 
                                      : entry.trustScore >= 50 
                                      ? 'bg-yellow-500/10 text-yellow-600' 
                                      : 'bg-red-500/10 text-red-600'
                                  }`}>
                                    {entry.trustScore}
                                  </span>
                                </td>
                                <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-sm text-foreground/80">
                                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                                    {entry.locale.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </>
        )}

        {/* Analytics Tab Content */}
        {activeMainTab === 'analytics' && (
          <>
            {isLoadingAnalytics ? (
              <div className="bg-white rounded-lg p-12 border border-border shadow-sm text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-foreground/60">Statisztikák betöltése...</p>
              </div>
            ) : analyticsStats ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-2xl font-bold text-foreground">{analyticsStats.total}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Összes Látogatás</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-green-500" />
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        {Math.floor(analyticsStats.avgDuration / 60)}:{String(analyticsStats.avgDuration % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Átlagos Időtartam</p>
                    <p className="text-xs text-foreground/60 mt-1">perc:másodperc</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <MousePointerClick className="w-6 h-6 text-blue-500" />
                      </div>
                      <span className="text-2xl font-bold text-foreground">{analyticsStats.clicks.length}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Különböző Kattintások</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-purple-500" />
                      </div>
                      <span className="text-2xl font-bold text-foreground">{analyticsStats.pagesViewed.length}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Megtekintett Oldalak</p>
                  </div>
                </div>

                {/* By Country */}
                <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Látogatások Országonként
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Ország</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Látogatások</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Összes Időtartam</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Átlagos Időtartam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analyticsStats.byCountry)
                          .sort(([, a], [, b]) => (b as any).count - (a as any).count)
                          .map(([country, data]: [string, any]) => (
                            <tr key={country} className="border-b border-border/50 hover:bg-background/50">
                              <td className="py-3 px-4 text-sm text-foreground/80 font-medium">{country}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">{data.count}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.totalDuration / 60)}:{String(data.totalDuration % 60).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.avgDuration / 60)}:{String(data.avgDuration % 60).padStart(2, '0')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* By Device */}
                <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Látogatások Eszközönként
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Eszköz</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Látogatások</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Összes Időtartam</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Átlagos Időtartam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analyticsStats.byDevice || {})
                          .sort(([, a], [, b]) => (b as any).count - (a as any).count)
                          .map(([device, data]: [string, any]) => (
                            <tr key={device} className="border-b border-border/50 hover:bg-background/50">
                              <td className="py-3 px-4 text-sm text-foreground/80 font-medium">{device}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">{data.count}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.totalDuration / 60)}:{String(data.totalDuration % 60).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.avgDuration / 60)}:{String(data.avgDuration % 60).padStart(2, '0')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* By Browser */}
                <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Látogatások Böngészőnként
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Böngésző</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Látogatások</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Összes Időtartam</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Átlagos Időtartam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analyticsStats.byBrowser || {})
                          .sort(([, a], [, b]) => (b as any).count - (a as any).count)
                          .map(([browser, data]: [string, any]) => (
                            <tr key={browser} className="border-b border-border/50 hover:bg-background/50">
                              <td className="py-3 px-4 text-sm text-foreground/80 font-medium">{browser}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">{data.count}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.totalDuration / 60)}:{String(data.totalDuration % 60).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.avgDuration / 60)}:{String(data.avgDuration % 60).padStart(2, '0')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* By OS */}
                <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Látogatások Operációs Rendszerenként
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Operációs Rendszer</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Látogatások</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Összes Időtartam</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Átlagos Időtartam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analyticsStats.byOS || {})
                          .sort(([, a], [, b]) => (b as any).count - (a as any).count)
                          .map(([os, data]: [string, any]) => (
                            <tr key={os} className="border-b border-border/50 hover:bg-background/50">
                              <td className="py-3 px-4 text-sm text-foreground/80 font-medium">{os}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">{data.count}</td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.totalDuration / 60)}:{String(data.totalDuration % 60).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground/80">
                                {Math.floor(data.avgDuration / 60)}:{String(data.avgDuration % 60).padStart(2, '0')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pages Viewed */}
                <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-500" />
                    Megtekintett Oldalak
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Oldal</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Megtekintések</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Összes Időtartam</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Átlagos Időtartam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsStats.pagesViewed.map((page: any) => (
                          <tr key={page.page} className="border-b border-border/50 hover:bg-background/50">
                            <td className="py-3 px-4 text-sm text-foreground/80 font-medium">{page.page}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{page.count}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">
                              {Math.floor(page.totalDuration / 60)}:{String(page.totalDuration % 60).padStart(2, '0')}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground/80">
                              {Math.floor(page.avgDuration / 60)}:{String(page.avgDuration % 60).padStart(2, '0')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Clicks */}
                <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-blue-500" />
                    Kattintások
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Elem</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Oldal</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Kattintások</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsStats.clicks.slice(0, 50).map((click: any, index: number) => (
                          <tr key={index} className="border-b border-border/50 hover:bg-background/50">
                            <td className="py-3 px-4 text-sm text-foreground/80 font-medium">{click.element}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{click.page}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{click.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detailed Entries */}
                <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Részletes Látogatások
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Dátum</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Ország</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Eszköz</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Böngésző</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">OS</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Oldal</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Időtartam</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Kattintások</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Megtekintett Oldalak</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsStats.entries.slice(0, 100).map((entry: any) => (
                          <tr key={entry.id} className="border-b border-border/50 hover:bg-background/50">
                            <td className="py-3 px-4 text-sm text-foreground/80">{formatDate(entry.timestamp)}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{entry.country}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{entry.device || 'Ismeretlen'}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{entry.browser || 'Ismeretlen'}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{entry.os || 'Ismeretlen'}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{entry.page}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">
                              {Math.floor(entry.duration / 60)}:{String(entry.duration % 60).padStart(2, '0')}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{entry.clicks.length}</td>
                            <td className="py-3 px-4 text-sm text-foreground/80">{entry.pagesViewed.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 border border-border shadow-sm text-center">
                <p className="text-foreground/60">Még nincsenek analytics adatok</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
