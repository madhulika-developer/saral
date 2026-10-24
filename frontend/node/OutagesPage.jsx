import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  AlertTriangle,
  MapPin,
  List,
  Map as MapIcon,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  Filter,
  Navigation,
  X,
  Zap,
  Droplets,
  Search
} from 'lucide-react';

// Custom Leaflet Icons for Power and Water
const createCustomIcon = (type, status) => {
  const isElectricity = type === 'electricity';
  const color =
    status === 'resolved' ? '#10b981' :
    status === 'crew_assigned' ? '#0d9488' :
    status === 'acknowledged' ? '#f59e0b' : '#ef4444';

  const svgHtml = `
    <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${isElectricity
          ? '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>'
          : '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>'}
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

const VIJAYAWADA_LOCALITIES = [
  "Benz Circle",
  "Labbipet",
  "Governorpet",
  "Patamata",
  "Auto Nagar",
  "Moghalrajpuram",
  "Gunadala",
  "Bhavanipuram",
  "Tadepalli",
  "Mangalagiri",
  "Gollapudi",
  "Satyanarayanapuram",
  "One Town",
  "Kanuru",
  "Poranki"
];

export const OutagesPage = () => {
  const { t } = useTranslation();
  const { utility, formatDate, formatTime, showToast } = useApp();

  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedUtility, setSelectedUtility] = useState(utility || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('electricity');
  const [reportLocality, setReportLocality] = useState('Labbipet');
  const [reportNote, setReportNote] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    fetchOutages();
  }, [selectedUtility, statusFilter]);

  const fetchOutages = async () => {
    setLoading(true);
    try {
      const data = await api.getOutages({
        utility: selectedUtility !== 'all' ? selectedUtility : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setOutages(data || []);
    } catch (err) {
      console.error('Error fetching outages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          showToast('GPS coordinates acquired', 'info');
        },
        () => {
          showToast('Location access denied, using selected locality coordinates', 'info');
        }
      );
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.reportOutage({
        type: reportType,
        locality: reportLocality,
        note: reportNote,
        lat: userCoords?.lat,
        lng: userCoords?.lng,
      });

      showToast(res.message, res.is_duplicate ? 'info' : 'success', 5000);
      setReportModalOpen(false);
      setReportNote('');
      fetchOutages();
    } catch (err) {
      showToast('Error reporting outage, please retry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOutages = outages.filter(o =>
    o.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.cause.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            {t('outages.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('outages.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              {t('outages.view_map')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              {t('outages.view_list')}
            </button>
          </div>

          {/* Report Button */}
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('outages.report_button')}
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            {['all', 'electricity', 'water'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedUtility(type)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedUtility === type
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {type === 'all' ? t('outages.filter_all') : type === 'electricity' ? '⚡ ' + t('app.electricity') : '💧 ' + t('app.water')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            {['all', 'reported', 'acknowledged', 'crew_assigned', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Locality Search */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locality..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main View Area: Map or List */}
      {viewMode === 'map' && !mapError ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="h-[520px] w-full rounded-2xl overflow-hidden relative">
            <MapContainer
              center={[16.5065, 80.6472]} // Vijayawada center
              zoom={13}
              scrollWheelZoom={false}
              className="h-full w-full z-10"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredOutages.map((o) => (
                <Marker
                  key={o.id}
                  position={[o.lat, o.lng]}
                  icon={createCustomIcon(o.type, o.status)}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 space-y-1.5 text-xs min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 border-b pb-1">
                        <span className="font-bold text-slate-900 uppercase">
                          {o.type} Disruption
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {o.id}
                        </span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {o.locality}
                      </div>
                      <p className="text-slate-600">
                        {o.cause}
                      </p>
                      <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800 font-medium text-[11px]">
                        👥 {o.reports_count} neighbours reported
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Est: {formatTime(o.estimated_restoration)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      ) : null}

      {/* List View (Always available and falls back cleanly) */}
      {(viewMode === 'list' || mapError) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOutages.map((o) => (
            <div
              key={o.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-teal-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl ${
                    o.type === 'electricity'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                      : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600'
                  }`}>
                    {o.type === 'electricity' ? <Zap className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {o.locality}
                      </h3>
                      <span className="font-mono text-[10px] text-slate-400">
                        #{o.id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {o.address}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                  o.status === 'resolved'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                    : o.status === 'crew_assigned'
                    ? 'bg-teal-100 dark:bg-teal-950 text-teal-700'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                }`}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>

              {/* Duplicate / Neighbour count badge */}
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-900">
                <Users className="w-4 h-4" />
                <span>{o.reports_count} {t('outages.neighbours_count')}</span>
              </div>

              {/* Cause & Crew details */}
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div>
                  <strong>{t('outages.cause')}:</strong> {o.cause}
                </div>
                {o.crew_details && (
                  <div>
                    <strong>{t('outages.crew')}:</strong> {o.crew_details}
                  </div>
                )}
                {o.estimated_restoration && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {t('outages.est_restoration')}: {formatDate(o.estimated_restoration)} • {formatTime(o.estimated_restoration)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Outage Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 animate-scale-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                {t('outages.modal_title')}
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
              {/* Type selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Utility Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReportType('electricity')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all ${
                      reportType === 'electricity'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    Electricity Power Cut
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('water')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all ${
                      reportType === 'water'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <Droplets className="w-4 h-4 text-sky-500" />
                    Water Disruption
                  </button>
                </div>
              </div>

              {/* Locality Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('outages.locality_select')}
                </label>
                <select
                  value={reportLocality}
                  onChange={(e) => setReportLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 text-xs font-medium"
                >
                  {VIJAYAWADA_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}, Vijayawada
                    </option>
                  ))}
                </select>
              </div>

              {/* GPS Location Button */}
              <div>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-teal-600" />
                  {userCoords ? 'GPS Location Attached ✓' : t('outages.use_location')}
                </button>
              </div>

              {/* Note / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Note (Any Language)
                </label>
                <textarea
                  rows={3}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder={t('outages.note_placeholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 text-xs focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
              >
                {submitting ? t('outages.submitting') : t('outages.submit_btn')}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
