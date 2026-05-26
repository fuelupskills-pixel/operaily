import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Linking, Alert, FlatList,
  Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EnrichedLead {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  designation: string | null;
  companyName: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  linkedinUrl: string | null;
  twitterHandle: string | null;
  score: number;
  source: string;
  personalizedHook: string | null;
  aiSummary: string | null;
  emailVerified: boolean;
  companySize: string | null;
  rawData?: Record<string, unknown>;
}

interface SearchStats {
  totalFound: number;
  withEmail: number;
  withPhone: number;
  withLinkedIn: number;
  hotLeads: number;
  averageScore: number;
  sourceBreakdown: {
    apollo: number;
    linkedin: number;
    tradePortals: number;
    governmentTenders: number;
    importExport: number;
    pharmaDirectory: number;
    b2b: number;
    web: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

const SOURCE_OPTIONS = [
  { id: 'apollo',        label: 'Apollo.io',           emoji: '🎯' },
  { id: 'linkedin',      label: 'LinkedIn',             emoji: '💼' },
  { id: 'trade_portals', label: 'Trade Portals',        emoji: '🏪' },
  { id: 'government',    label: 'Gov Tenders',          emoji: '🏛️' },
  { id: 'pharma_dir',    label: 'Pharma Dirs',          emoji: '💊' },
  { id: 'import_export', label: 'Import/Export DB',     emoji: '📦' },
  { id: 'indiamart',     label: 'IndiaMART',            emoji: '🇮🇳' },
  { id: 'web',           label: 'Web Crawl',            emoji: '🌐' },
];

const POPULAR_SEARCHES = [
  { industry: 'Pharmaceutical Importers',      country: 'Germany',       emoji: '💊' },
  { industry: 'Medical Equipment Distributors',country: 'Nigeria',       emoji: '🏥' },
  { industry: 'Lab Equipment Buyers',          country: 'USA',           emoji: '🔬' },
  { industry: 'Nutraceutical Distributors',    country: 'UAE',           emoji: '🌿' },
  { industry: 'Hospital Procurement',          country: 'Kenya',         emoji: '🏨' },
  { industry: 'Generic Medicine Importers',    country: 'Brazil',        emoji: '💉' },
];

const SEARCH_PHASES = [
  '🎯 Querying Apollo.io...',
  '💼 Scanning LinkedIn...',
  '🏪 Mining trade portals...',
  '🏛️ Searching gov tenders...',
  '💊 Pharma directories...',
  '📦 Import/export databases...',
  '🌐 Web crawling...',
  '🔄 Deduplicating records...',
  '🤖 AI scoring & enriching...',
  '✨ Results ready!',
];

// ─── Source Badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const badges: Record<string, { label: string; color: string; bg: string }> = {
    apollo:            { label: 'Apollo',      color: '#a78bfa', bg: '#a78bfa20' },
    linkedin:          { label: 'LinkedIn',    color: '#60a5fa', bg: '#60a5fa20' },
    government_tender: { label: 'GOV TENDER', color: '#f87171', bg: '#f8717120' },
    trade_portal:      { label: 'Trade',       color: '#fb923c', bg: '#fb923c20' },
    import_database:   { label: 'Import DB',   color: '#fbbf24', bg: '#fbbf2420' },
    pharma_directory:  { label: 'Pharma Dir',  color: '#34d399', bg: '#34d39920' },
    indiamart:         { label: 'IndiaMART',   color: '#4ade80', bg: '#4ade8020' },
    web_scraper:       { label: 'Web',         color: '#22d3ee', bg: '#22d3ee20' },
    deep_search:       { label: 'Deep Web',    color: '#c084fc', bg: '#c084fc20' },
  };
  const b = badges[source] || { label: source, color: '#888', bg: '#88888820' };
  return (
    <View style={[styles.badge, { backgroundColor: b.bg, borderColor: b.color + '40' }]}>
      <Text style={[styles.badgeText, { color: b.color }]}>{b.label}</Text>
    </View>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? '#34d399' : score >= 75 ? '#60a5fa' : score >= 60 ? '#a78bfa' : '#fbbf24';
  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text style={[styles.scoreText, { color }]}>{score}</Text>
    </View>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, onImport }: { lead: EnrichedLead; onImport: (l: EnrichedLead) => void }) {
  const [expanded, setExpanded] = useState(false);

  const openUrl = (url: string) => {
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${clean}`).catch(() => {});
  };

  const isGovTender = lead.source === 'government_tender';

  return (
    <View style={[styles.leadCard, isGovTender && styles.leadCardGov]}>
      {/* Header row */}
      <View style={styles.leadHeader}>
        <View style={styles.leadAvatarWrap}>
          <View style={styles.leadAvatar}>
            <Text style={styles.leadAvatarText}>
              {(lead.firstName?.[0] || '?')}{(lead.lastName?.[0] || '')}
            </Text>
          </View>
        </View>
        <View style={styles.leadInfo}>
          <View style={styles.leadNameRow}>
            <Text style={styles.leadName} numberOfLines={1}>
              {lead.firstName} {lead.lastName}
            </Text>
            {lead.emailVerified && <Text style={styles.verifiedDot}>✓</Text>}
          </View>
          <Text style={styles.leadDesig} numberOfLines={1}>
            {lead.designation}{lead.companyName ? ` @ ${lead.companyName}` : ''}
          </Text>
          <Text style={styles.leadLoc} numberOfLines={1}>
            📍 {[lead.city, lead.country].filter(Boolean).join(', ')}
          </Text>
          <View style={styles.badgeRow}>
            <SourceBadge source={lead.source} />
            {isGovTender && (
              <View style={[styles.badge, { backgroundColor: '#f8717120', borderColor: '#f8717140' }]}>
                <Text style={[styles.badgeText, { color: '#f87171', fontWeight: 'bold' }]}>🏛️ GOV</Text>
              </View>
            )}
          </View>
        </View>
        <ScoreRing score={lead.score} />
      </View>

      {/* ── Contact Details (ALWAYS VISIBLE) ───────────────────────────── */}
      <View style={styles.contactBlock}>
        {lead.email && (
          <TouchableOpacity style={styles.contactRow} onPress={() => openEmail(lead.email!)}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactEmail} numberOfLines={1}>{lead.email}</Text>
          </TouchableOpacity>
        )}
        {lead.phone && (
          <TouchableOpacity style={styles.contactRow} onPress={() => callPhone(lead.phone!)}>
            <Text style={styles.contactIcon}>📱</Text>
            <Text style={styles.contactPhone}>{lead.phone}</Text>
          </TouchableOpacity>
        )}
        {lead.website && (
          <TouchableOpacity style={styles.contactRow} onPress={() => openUrl(lead.website!)}>
            <Text style={styles.contactIcon}>🌐</Text>
            <Text style={styles.contactWebsite} numberOfLines={1}>
              {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
            </Text>
          </TouchableOpacity>
        )}
        {lead.linkedinUrl && (
          <TouchableOpacity style={styles.contactRow} onPress={() => openUrl(lead.linkedinUrl!)}>
            <Text style={styles.contactIcon}>💼</Text>
            <Text style={styles.contactLinkedIn}>LinkedIn Profile</Text>
          </TouchableOpacity>
        )}
        {!lead.email && !lead.phone && !lead.website && !lead.linkedinUrl && (
          <Text style={styles.noContact}>No direct contact — tap expand for source details</Text>
        )}
      </View>

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onImport(lead)}>
          <Text style={styles.actionBtnText}>⬇️ Import</Text>
        </TouchableOpacity>
        {lead.whatsapp && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnWA]}
            onPress={() => openWhatsApp(lead.whatsapp!)}
          >
            <Text style={styles.actionBtnText}>💬 WhatsApp</Text>
          </TouchableOpacity>
        )}
        {lead.email && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnEmail]}
            onPress={() => openEmail(lead.email!)}
          >
            <Text style={styles.actionBtnText}>✉️ Email</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnExpand]}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.actionBtnText}>{expanded ? '▲ Less' : '▼ More'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Expanded ─────────────────────────────────────────────────── */}
      {expanded && (
        <View style={styles.expandedSection}>
          {lead.personalizedHook && (
            <View style={styles.hookBox}>
              <Text style={styles.hookLabel}>✨ AI OUTREACH HOOK</Text>
              <Text style={styles.hookText}>{lead.personalizedHook}</Text>
            </View>
          )}
          {lead.aiSummary && (
            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Summary: </Text>{lead.aiSummary}</Text>
          )}
          {lead.companySize && (
            <Text style={styles.metaText}>Company Size: {lead.companySize}</Text>
          )}
          {lead.rawData && Object.entries(lead.rawData).filter(([, v]) => v).slice(0, 4).map(([k, v]) => (
            <Text key={k} style={styles.metaText}>
              {k.replace(/_/g, ' ')}: {String(v)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function HunterScreen() {
  const [industry, setIndustry]               = useState('');
  const [country, setCountry]                 = useState('');
  const [isSearching, setIsSearching]         = useState(false);
  const [phaseIndex, setPhaseIndex]           = useState(0);
  const [results, setResults]                 = useState<EnrichedLead[]>([]);
  const [stats, setStats]                     = useState<SearchStats | null>(null);
  const [error, setError]                     = useState('');
  const [showSources, setShowSources]         = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(['apollo', 'linkedin', 'trade_portals', 'government', 'pharma_dir', 'import_export', 'web'])
  );
  const [hasSearched, setHasSearched]         = useState(false);
  const phaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!industry.trim() || !country.trim()) return;
    setIsSearching(true);
    setResults([]);
    setStats(null);
    setError('');
    setHasSearched(true);
    setPhaseIndex(0);

    let idx = 0;
    phaseTimer.current = setInterval(() => {
      idx = Math.min(idx + 1, SEARCH_PHASES.length - 1);
      setPhaseIndex(idx);
    }, 1200);

    try {
      const response = await fetch(`${API_BASE}/api/hunter/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry.trim(),
          country: country.trim(),
          deepSearch: false,
          sources: Array.from(selectedSources),
          limit: 50,
        }),
      });

      if (phaseTimer.current) clearInterval(phaseTimer.current);
      setPhaseIndex(SEARCH_PHASES.length - 1);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      setStats(data.stats || null);
    } catch (err: any) {
      if (phaseTimer.current) clearInterval(phaseTimer.current);
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // ── Import single lead ─────────────────────────────────────────────────────
  const handleImport = async (lead: EnrichedLead) => {
    try {
      const response = await fetch(`${API_BASE}/api/hunter/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: [lead] }),
      });
      const data = await response.json();
      Alert.alert('Success', `${data.imported} lead imported to CRM`);
    } catch {
      Alert.alert('Error', 'Import failed');
    }
  };

  // ── Import all ─────────────────────────────────────────────────────────────
  const handleImportAll = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/hunter/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: results }),
      });
      const data = await response.json();
      Alert.alert('Success', `${data.imported} leads imported! ${data.skippedDuplicates || 0} duplicates skipped.`);
    } catch {
      Alert.alert('Error', 'Bulk import failed');
    }
  };

  // ── Toggle source ──────────────────────────────────────────────────────────
  const toggleSource = (id: string) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(id) && next.size > 1) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌍 Lead Intelligence</Text>
          <Text style={styles.headerSub}>Pharma · Medical · Nutraceuticals · Lab Equipment</Text>
        </View>

        {/* ── Search Form ────────────────────────────────────────────── */}
        <View style={styles.searchCard}>
          <TextInput
            style={styles.input}
            placeholder="Industry (e.g., Pharmaceutical Importers)"
            placeholderTextColor="#666"
            value={industry}
            onChangeText={setIndustry}
          />
          <TextInput
            style={styles.input}
            placeholder="Country (e.g., Germany)"
            placeholderTextColor="#666"
            value={country}
            onChangeText={setCountry}
          />

          {/* Source selector */}
          <TouchableOpacity
            style={styles.sourceToggleBtn}
            onPress={() => setShowSources(!showSources)}
          >
            <Text style={styles.sourceToggleText}>
              🔧 {selectedSources.size} sources selected {showSources ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showSources && (
            <View style={styles.sourceGrid}>
              {SOURCE_OPTIONS.map(src => (
                <TouchableOpacity
                  key={src.id}
                  style={[
                    styles.sourceChip,
                    selectedSources.has(src.id) && styles.sourceChipActive,
                  ]}
                  onPress={() => toggleSource(src.id)}
                >
                  <Text style={styles.sourceChipText}>{src.emoji} {src.label}</Text>
                  {selectedSources.has(src.id) && <Text style={styles.sourceCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.searchBtn, (!industry || !country || isSearching) && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={!industry || !country || isSearching}
          >
            {isSearching
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.searchBtnText}>✨ Hunt Leads</Text>
            }
          </TouchableOpacity>

          {/* Search phases */}
          {isSearching && (
            <View style={styles.phasesBox}>
              {SEARCH_PHASES.map((phase, i) => (
                <View key={i} style={styles.phaseRow}>
                  <Text style={[
                    styles.phaseDot,
                    i < phaseIndex ? styles.phaseDotDone :
                    i === phaseIndex ? styles.phaseDotActive :
                    styles.phaseDotPending,
                  ]}>
                    {i < phaseIndex ? '✅' : i === phaseIndex ? '⏳' : '○'}
                  </Text>
                  <Text style={[
                    styles.phaseText,
                    i <= phaseIndex ? styles.phaseTextActive : styles.phaseTextPending,
                  ]}>
                    {phase}
                  </Text>
                </View>
              ))}
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  { width: `${((phaseIndex + 1) / SEARCH_PHASES.length) * 100}%` as any },
                ]} />
              </View>
            </View>
          )}

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}
        </View>

        {/* ── Popular Searches ────────────────────────────────────────── */}
        {!hasSearched && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>POPULAR SEARCHES</Text>
            <View style={styles.popularGrid}>
              {POPULAR_SEARCHES.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.popularChip}
                  onPress={() => { setIndustry(s.industry); setCountry(s.country); }}
                >
                  <Text style={styles.popularEmoji}>{s.emoji}</Text>
                  <View>
                    <Text style={styles.popularIndustry} numberOfLines={2}>{s.industry}</Text>
                    <Text style={styles.popularCountry}>{s.country}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Stats ──────────────────────────────────────────────────── */}
        {stats && !isSearching && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RESULTS OVERVIEW</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
              {[
                { label: 'Found',    value: stats.totalFound,   color: '#a78bfa' },
                { label: 'Email',    value: stats.withEmail,    color: '#34d399' },
                { label: 'Phone',    value: stats.withPhone,    color: '#60a5fa' },
                { label: 'LinkedIn', value: stats.withLinkedIn, color: '#38bdf8' },
                { label: 'Hot 🔥',   value: stats.hotLeads,    color: '#f87171' },
                { label: 'Avg Score',value: stats.averageScore, color: '#fbbf24' },
              ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Source breakdown */}
            <View style={styles.sourceBreakdown}>
              {[
                { label: 'Apollo',    count: stats.sourceBreakdown.apollo,           color: '#a78bfa' },
                { label: 'Trade',     count: stats.sourceBreakdown.tradePortals,      color: '#fb923c' },
                { label: 'Gov',       count: stats.sourceBreakdown.governmentTenders, color: '#f87171' },
                { label: 'Import DB', count: stats.sourceBreakdown.importExport,      color: '#fbbf24' },
                { label: 'Pharma',    count: stats.sourceBreakdown.pharmaDirectory,   color: '#34d399' },
                { label: 'LinkedIn',  count: stats.sourceBreakdown.linkedin,          color: '#60a5fa' },
                { label: 'B2B',       count: stats.sourceBreakdown.b2b,              color: '#4ade80' },
                { label: 'Web',       count: stats.sourceBreakdown.web,              color: '#22d3ee' },
              ]
                .filter(s => s.count > 0)
                .map((s, i) => (
                  <View key={i} style={[styles.srcPill, { borderColor: s.color + '60', backgroundColor: s.color + '20' }]}>
                    <Text style={[styles.srcPillText, { color: s.color }]}>{s.label} ({s.count})</Text>
                  </View>
                ))}
            </View>

            {/* Import all */}
            <TouchableOpacity style={styles.importAllBtn} onPress={handleImportAll}>
              <Text style={styles.importAllText}>⬇️ Import All {stats.totalFound} Leads to CRM</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Lead Results ────────────────────────────────────────────── */}
        {results.length > 0 && !isSearching && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{results.length} LEADS FOUND</Text>
            {results.map((lead, i) => (
              <LeadCard key={i} lead={lead} onImport={handleImport} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#080810' },
  header:           { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle:      { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:        { fontSize: 12, color: '#666', marginTop: 2 },

  searchCard:       { marginHorizontal: 16, backgroundColor: '#12121e', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#1e1e35', marginBottom: 16 },
  input:            { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 10, fontSize: 14, borderWidth: 1, borderColor: '#222240' },

  sourceToggleBtn:  { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#222240' },
  sourceToggleText: { color: '#888', fontSize: 13, textAlign: 'center' },
  sourceGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  sourceChip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#333' },
  sourceChipActive: { backgroundColor: '#7c3aed20', borderColor: '#7c3aed80' },
  sourceChipText:   { color: '#aaa', fontSize: 11 },
  sourceCheck:      { color: '#7c3aed', fontSize: 11, marginLeft: 2 },

  searchBtn:        { backgroundColor: '#7c3aed', borderRadius: 14, padding: 14, alignItems: 'center' },
  searchBtnDisabled:{ opacity: 0.4 },
  searchBtnText:    { color: '#fff', fontWeight: '700', fontSize: 16 },

  phasesBox:        { marginTop: 14 },
  phaseRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  phaseDot:         { fontSize: 14, width: 22 },
  phaseDotDone:     {},
  phaseDotActive:   {},
  phaseDotPending:  {},
  phaseText:        { fontSize: 12 },
  phaseTextActive:  { color: '#ccc' },
  phaseTextPending: { color: '#444' },
  progressBar:      { height: 4, backgroundColor: '#1e1e35', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressFill:     { height: 4, backgroundColor: '#7c3aed', borderRadius: 2 },

  errorText:        { color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 10 },

  section:          { paddingHorizontal: 16, marginBottom: 16 },
  sectionLabel:     { fontSize: 11, fontWeight: '700', color: '#555', letterSpacing: 1.2, marginBottom: 10 },

  popularGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  popularChip:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#12121e', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#1e1e35', width: '47%' },
  popularEmoji:     { fontSize: 22 },
  popularIndustry:  { color: '#ddd', fontSize: 11, fontWeight: '600' },
  popularCountry:   { color: '#666', fontSize: 10, marginTop: 2 },

  statsRow:         { marginBottom: 12 },
  statCard:         { backgroundColor: '#12121e', borderRadius: 14, padding: 14, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#1e1e35', minWidth: 80 },
  statValue:        { fontSize: 22, fontWeight: '800' },
  statLabel:        { color: '#666', fontSize: 10, marginTop: 2, textAlign: 'center' },

  sourceBreakdown:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  srcPill:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  srcPillText:      { fontSize: 11, fontWeight: '600' },

  importAllBtn:     { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  importAllText:    { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Lead Card
  leadCard:         { backgroundColor: '#12121e', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1e1e35' },
  leadCardGov:      { borderColor: '#f8717140', backgroundColor: '#f8717108' },

  leadHeader:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  leadAvatarWrap:   {},
  leadAvatar:       { width: 44, height: 44, borderRadius: 12, backgroundColor: '#7c3aed30', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#7c3aed40' },
  leadAvatarText:   { color: '#a78bfa', fontWeight: '700', fontSize: 16 },
  leadInfo:         { flex: 1 },
  leadNameRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leadName:         { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1 },
  verifiedDot:      { color: '#34d399', fontSize: 12 },
  leadDesig:        { color: '#888', fontSize: 12, marginTop: 2 },
  leadLoc:          { color: '#666', fontSize: 11, marginTop: 2 },
  badgeRow:         { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  badge:            { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText:        { fontSize: 10, fontWeight: '600' },

  scoreRing:        { width: 46, height: 46, borderRadius: 23, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreText:        { fontWeight: '800', fontSize: 15 },

  contactBlock:     { backgroundColor: '#0d0d1a', borderRadius: 10, padding: 10, gap: 6, marginBottom: 10 },
  contactRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactIcon:      { fontSize: 14 },
  contactEmail:     { color: '#34d399', fontSize: 12, flex: 1 },
  contactPhone:     { color: '#60a5fa', fontSize: 12 },
  contactWebsite:   { color: '#22d3ee', fontSize: 12, flex: 1 },
  contactLinkedIn:  { color: '#60a5fa', fontSize: 12 },
  noContact:        { color: '#444', fontSize: 11, fontStyle: 'italic', textAlign: 'center', paddingVertical: 4 },

  actionRow:        { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actionBtn:        { backgroundColor: '#7c3aed20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#7c3aed40' },
  actionBtnWA:      { backgroundColor: '#25D36620', borderColor: '#25D36640' },
  actionBtnEmail:   { backgroundColor: '#3b82f620', borderColor: '#3b82f640' },
  actionBtnExpand:  { backgroundColor: '#1e1e35', borderColor: '#333' },
  actionBtnText:    { color: '#ddd', fontSize: 11, fontWeight: '600' },

  expandedSection:  { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e1e35', gap: 8 },
  hookBox:          { backgroundColor: '#7c3aed10', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#7c3aed30' },
  hookLabel:        { color: '#a78bfa', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  hookText:         { color: '#ccc', fontSize: 12, lineHeight: 18 },
  summaryText:      { color: '#888', fontSize: 12 },
  summaryLabel:     { color: '#666', fontWeight: '600' },
  metaText:         { color: '#666', fontSize: 11 },
});
