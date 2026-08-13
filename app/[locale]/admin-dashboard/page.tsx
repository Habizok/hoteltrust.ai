'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Building2,
  LogOut,
  RefreshCw,
  Download,
  Clock,
  MousePointerClick,
  Eye,
  BarChart3,
  Globe,
  KeyRound,
  Trash2
} from 'lucide-react';

interface DashboardData {
  stats: {
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
    analytics: {
      total: number;
      totalDuration: number;
      averageDuration: number;
      totalClicks: number;
      totalPageViews: number;
    };
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
    analytics: Array<{
      id: string;
      sessionId: string;
      country: string;
      countryCode: string;
      page: string;
      duration: number;
      timestamp: string;
      device: string;
      browser: string;
      os: string;
      clicks: Array<{ element: string; page: string; timestamp: string }>;
      pagesViewed: Array<{ page: string; timestamp: string; duration: number }>;
    }>;
  };
}

interface ApiKeyEntry {
  id: string;
  provider: string;
  label: string;
  maskedKey: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'waitlist' | 'audit' | 'analytics' | 'apiKeys'>('waitlist');

  // API kulcsok állapot
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [apiKeysError, setApiKeysError] = useState('');
  const [apiProvider, setApiProvider] = useState('');
  const [apiLabel, setApiLabel] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);

  useEffect(() => {
    fetchData();
    fetchApiKeys();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/data');
      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      } else {
        if (response.status === 401) {
          router.push(`/${locale}/admin`);
        } else {
          setError(result.error || 'Hiba történt az adatok lekérése során');
        }
      }
    } catch (error) {
      setError('Hiba történt az adatok lekérése során');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    setApiKeysLoading(true);
    setApiKeysError('');
    try {
      const response = await fetch('/api/admin/api-keys');
      const result = await response.json();

      if (response.ok) {
        setApiKeys(result.data || []);
      } else {
        if (response.status === 401) {
          router.push(`/${locale}/admin`);
        } else {
          setApiKeysError(result.error || 'Hiba történt az API kulcsok lekérése során');
        }
      }
    } catch (error) {
      setApiKeysError('Hiba történt az API kulcsok lekérése során');
    } finally {
      setApiKeysLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      router.push(`/${locale}/admin`);
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
      second: '2-digit',
      timeZone: 'Europe/Budapest',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} perc ${secs} másodperc`;
  };

  const exportToCSV = () => {
    if (!data) return;

    let csvContent = '';
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    if (activeTab === 'waitlist') {
      csvContent = 'ID,Dátum,Email,Hotel név,Nyelv\n';
      data.entries.waitlist.forEach((entry) => {
        csvContent += `${escapeCSV(entry.id)},${escapeCSV(formatDate(entry.createdAt))},${escapeCSV(entry.email)},${escapeCSV(entry.hotelName)},${escapeCSV(entry.locale.toUpperCase())}\n`;
      });
    } else if (activeTab === 'audit') {
      csvContent = 'ID,Dátum,Email,Hotel név,Trust Score,Összes vélemény,Válaszolt,Válaszolatlan,ChatGPT látható,ChatGPT pozíció,Gemini látható,Gemini pozíció,Bing látható,Bing pozíció,Bevételkiesés,Kritikus hibák,Javaslatok,Nyelv\n';
      data.entries.audit.forEach((entry) => {
        const chatgptVisible = entry.aiVisibility.chatgpt.visible ? 'Igen' : 'Nem';
        const chatgptPosition = entry.aiVisibility.chatgpt.position || '';
        const geminiVisible = entry.aiVisibility.gemini.visible ? 'Igen' : 'Nem';
        const geminiPosition = entry.aiVisibility.gemini.position || '';
        const bingVisible = entry.aiVisibility.bing.visible ? 'Igen' : 'Nem';
        const bingPosition = entry.aiVisibility.bing.position || '';
        const criticalIssues = entry.criticalIssues.join(' | ');
        const recommendations = entry.recommendations.join(' | ');
        csvContent += `${escapeCSV(entry.id)},${escapeCSV(formatDate(entry.createdAt))},${escapeCSV(entry.email)},${escapeCSV(entry.hotelName)},${escapeCSV(entry.trustScore)},${escapeCSV(entry.totalReviews || '')},${escapeCSV(entry.answeredReviews || '')},${escapeCSV(entry.unansweredReviews)},${escapeCSV(chatgptVisible)},${escapeCSV(chatgptPosition)},${escapeCSV(geminiVisible)},${escapeCSV(geminiPosition)},${escapeCSV(bingVisible)},${escapeCSV(bingPosition)},${escapeCSV(entry.revenueLoss)},${escapeCSV(criticalIssues)},${escapeCSV(recommendations)},${escapeCSV(entry.locale.toUpperCase())}\n`;
      });
    } else if (activeTab === 'analytics') {
      csvContent = 'ID,Dátum,Ország,Oldal,Időtartam,Eszköz,Böngésző,OS,Kattintások,Oldalnézetek\n';
      data.entries.analytics.forEach((entry) => {
        csvContent += `${escapeCSV(entry.id)},${escapeCSV(formatDate(entry.timestamp))},${escapeCSV(entry.country)},${escapeCSV(entry.page)},${escapeCSV(formatDuration(entry.duration))},${escapeCSV(entry.device)},${escapeCSV(entry.browser)},${escapeCSV(entry.os)},${escapeCSV(entry.clicks.length)},${escapeCSV(entry.pagesViewed.length)}\n`;
      });
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = activeTab === 'waitlist' 
      ? `varolista-export-${timestamp}.csv`
      : activeTab === 'audit'
      ? `audit-export-${timestamp}.csv`
      : `analytics-export-${timestamp}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/60">Adatok betöltése...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
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

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-foreground/60">Trusthotel Statisztikák</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  if (confirm('⚠️ FIGYELEM! Biztosan törölni szeretnéd az ÖSSZES adatot?\n\nEz törli:\n- Minden várólista regisztrációt\n- Minden audit kérést\n- Minden analytics adatot\n\nEz a művelet NEM VISSZAVONHATÓ!')) {
                    try {
                      const response = await fetch('/api/admin/clear-data', {
                        method: 'POST',
                      });
                      const result = await response.json();
                      if (response.ok) {
                        alert('✅ Minden adat törölve!');
                        fetchData(); // Refresh data
                      } else {
                        alert('❌ Hiba történt: ' + (result.error || 'Ismeretlen hiba'));
                      }
                    } catch (error) {
                      alert('❌ Hiba történt az adatok törlése során');
                    }
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                title="Összes adat törlése"
              >
                Adatok törlése
              </button>
              <button
                onClick={fetchData}
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Waitlist Stats */}
          <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">{data.stats.waitlist.total}</span>
            </div>
            <h3 className="text-sm font-medium text-foreground/60 mb-2">Várólista</h3>
            <div className="space-y-1 text-xs text-foreground/60">
              <p>Ma: {data.stats.waitlist.today}</p>
              <p>Ez a hét: {data.stats.waitlist.thisWeek}</p>
              <p>Ez a hónap: {data.stats.waitlist.thisMonth}</p>
            </div>
          </div>

          {/* Audit Stats */}
          <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-foreground">{data.stats.audit.total}</span>
            </div>
            <h3 className="text-sm font-medium text-foreground/60 mb-2">Auditok</h3>
            <div className="space-y-1 text-xs text-foreground/60">
              <p>Átlag Trust Score: {data.stats.audit.averageTrustScore}</p>
              <p>Ma: {data.stats.audit.today}</p>
              <p>Ez a hét: {data.stats.audit.thisWeek}</p>
            </div>
          </div>

          {/* Analytics Stats */}
          <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-foreground">{data.stats.analytics.total}</span>
            </div>
            <h3 className="text-sm font-medium text-foreground/60 mb-2">Látogatások</h3>
            <div className="space-y-1 text-xs text-foreground/60">
              <p>Átlag időtartam: {formatDuration(data.stats.analytics.averageDuration)}</p>
              <p>Kattintások: {data.stats.analytics.totalClicks}</p>
              <p>Oldalnézetek: {data.stats.analytics.totalPageViews}</p>
            </div>
          </div>

          {/* Locale Stats */}
          <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Globe className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-foreground">
                {data.stats.waitlist.byLocale.hu + data.stats.audit.byLocale.hu}
              </span>
            </div>
            <h3 className="text-sm font-medium text-foreground/60 mb-2">Magyar</h3>
            <div className="space-y-1 text-xs text-foreground/60">
              <p>Várólista: {data.stats.waitlist.byLocale.hu}</p>
              <p>Audit: {data.stats.audit.byLocale.hu}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-border shadow-sm mb-6">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('waitlist')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'waitlist'
                    ? 'bg-primary text-white'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                Várólista ({data.entries.waitlist.length})
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-primary text-white'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                Auditok ({data.entries.audit.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-primary text-white'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                Analytics ({data.entries.analytics.length})
              </button>
              <button
                onClick={() => setActiveTab('apiKeys')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'apiKeys'
                    ? 'bg-primary text-white'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                API kulcsok
              </button>
            </div>
            <button
              onClick={exportToCSV}
              disabled={!data || (activeTab === 'waitlist' ? data.entries.waitlist.length === 0 : activeTab === 'audit' ? data.entries.audit.length === 0 : data.entries.analytics.length === 0)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV Export
            </button>
          </div>

          {/* Table */}
          <div className="p-6">
            {activeTab === 'waitlist' && (
              <div className="overflow-x-auto">
                {data.entries.waitlist.length === 0 ? (
                  <p className="text-center text-foreground/60 py-8">Még nincsenek várólista regisztrációk</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Dátum</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Hotel név</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Nyelv</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.waitlist.map((entry) => (
                        <tr key={entry.id} className="border-b border-border hover:bg-background/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-foreground/80">{formatDate(entry.createdAt)}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.email}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.hotelName}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.locale.toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="overflow-x-auto">
                {data.entries.audit.length === 0 ? (
                  <p className="text-center text-foreground/60 py-8">Még nincsenek audit kérések</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Dátum</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Hotel név</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Trust Score</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Vélemények</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">AI Láthatóság</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.audit.map((entry) => (
                        <tr key={entry.id} className="border-b border-border hover:bg-background/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-foreground/80">{formatDate(entry.createdAt)}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.email}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.hotelName}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">
                            <span className={`font-semibold ${
                              entry.trustScore < 50 ? 'text-red-500' : entry.trustScore < 70 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {entry.trustScore}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground/80">
                            {entry.answeredReviews || 0} / {entry.totalReviews || 0}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground/80">
                            <div className="flex gap-2">
                              {entry.aiVisibility.chatgpt.visible && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  ChatGPT {entry.aiVisibility.chatgpt.position || ''}
                                </span>
                              )}
                              {entry.aiVisibility.gemini.visible && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  Gemini {entry.aiVisibility.gemini.position || ''}
                                </span>
                              )}
                              {entry.aiVisibility.bing.visible && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                  Bing {entry.aiVisibility.bing.position || ''}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="overflow-x-auto">
                {data.entries.analytics.length === 0 ? (
                  <p className="text-center text-foreground/60 py-8">Még nincsenek analytics adatok</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Dátum</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Ország</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Oldal</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Időtartam</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Eszköz</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Böngésző</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">OS</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Kattintások</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Oldalnézetek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.analytics.map((entry) => (
                        <tr key={entry.id} className="border-b border-border hover:bg-background/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-foreground/80">{formatDate(entry.timestamp)}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.country}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.page}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{formatDuration(entry.duration)}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.device}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.browser}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.os}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.clicks.length}</td>
                          <td className="py-3 px-4 text-sm text-foreground/80">{entry.pagesViewed.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'apiKeys' && (
              <div className="space-y-6">
                {/* Info box */}
                <div className="bg-background rounded-lg border border-border p-4 text-sm text-foreground/70">
                  <p className="mb-1">
                    Itt tudsz megadni különböző szolgáltatóktól származó API kulcsokat (pl. OpenAI, Gemini, Google Places), 
                    amelyeket a HotelTrust a háttérben használ.
                  </p>
                  <p className="text-xs text-foreground/50">
                    A kulcsok a Redis-ben tárolódnak. A teljes kulcsot csak mentéskor kérjük el, később csak maszkolt formában jelenik meg.
                  </p>
                </div>

                {/* New API key form */}
                <div className="bg-white rounded-lg border border-border p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-primary" />
                    Új API kulcs hozzáadása
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-foreground/70 mb-1">
                        Szolgáltató (pl. openai, gemini, google-places)
                      </label>
                      <input
                        type="text"
                        value={apiProvider}
                        onChange={(e) => setApiProvider(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="openai"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground/70 mb-1">
                        Megnevezés (pl. Production OpenAI kulcs)
                      </label>
                      <input
                        type="text"
                        value={apiLabel}
                        onChange={(e) => setApiLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Production OpenAI kulcs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground/70 mb-1">
                        API kulcs
                      </label>
                      <input
                        type="password"
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="sk-..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        if (!apiProvider || !apiLabel || !apiKeyValue) {
                          alert('Kérlek tölts ki minden mezőt (szolgáltató, megnevezés, API kulcs).');
                          return;
                        }
                        setIsSavingApiKey(true);
                        try {
                          const response = await fetch('/api/admin/api-keys', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              provider: apiProvider.trim(),
                              label: apiLabel.trim(),
                              key: apiKeyValue.trim(),
                            }),
                          });
                          const result = await response.json();
                          if (response.ok) {
                            setApiProvider('');
                            setApiLabel('');
                            setApiKeyValue('');
                            fetchApiKeys();
                          } else {
                            alert(result.error || 'Hiba történt az API kulcs mentése során');
                          }
                        } catch (error) {
                          alert('Hiba történt az API kulcs mentése során');
                        } finally {
                          setIsSavingApiKey(false);
                        }
                      }}
                      disabled={isSavingApiKey}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingApiKey ? 'Mentés...' : 'API kulcs mentése'}
                    </button>
                  </div>
                </div>

                {/* Saved API keys list */}
                <div className="bg-white rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Mentett API kulcsok
                    </h3>
                    <button
                      onClick={fetchApiKeys}
                      className="p-2 rounded-md hover:bg-background transition-colors"
                      title="API kulcsok frissítése"
                    >
                      <RefreshCw className="w-4 h-4 text-foreground/60" />
                    </button>
                  </div>
                  {apiKeysLoading ? (
                    <p className="text-sm text-foreground/60">API kulcsok betöltése...</p>
                  ) : apiKeysError ? (
                    <p className="text-sm text-red-600">{apiKeysError}</p>
                  ) : apiKeys.length === 0 ? (
                    <p className="text-sm text-foreground/60">Még nincsenek mentett API kulcsok.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 font-semibold text-foreground">Szolgáltató</th>
                            <th className="text-left py-2 px-3 font-semibold text-foreground">Megnevezés</th>
                            <th className="text-left py-2 px-3 font-semibold text-foreground">API kulcs</th>
                            <th className="text-left py-2 px-3 font-semibold text-foreground">Műveletek</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiKeys.map((key) => (
                            <tr key={key.id} className="border-b border-border hover:bg-background/50 transition-colors">
                              <td className="py-2 px-3 text-foreground/80">{key.provider}</td>
                              <td className="py-2 px-3 text-foreground/80">{key.label}</td>
                              <td className="py-2 px-3 text-foreground/80 font-mono">{key.maskedKey}</td>
                              <td className="py-2 px-3 text-foreground/80">
                                <button
                                  onClick={async () => {
                                    if (!confirm('Biztosan törölni szeretnéd ezt az API kulcsot?')) return;
                                    try {
                                      const response = await fetch('/api/admin/api-keys', {
                                        method: 'DELETE',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ id: key.id }),
                                      });
                                      const result = await response.json();
                                      if (response.ok) {
                                        fetchApiKeys();
                                      } else {
                                        alert(result.error || 'Hiba történt az API kulcs törlése során');
                                      }
                                    } catch (error) {
                                      alert('Hiba történt az API kulcs törlése során');
                                    }
                                  }}
                                  className="p-1 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                                  title="API kulcs törlése"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
