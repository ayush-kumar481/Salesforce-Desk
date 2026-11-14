import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { objectIcons } from './constants';
import { api } from './lib/api';
import { displayValue, getFieldValue } from './lib/format';
import RecordModal from './components/RecordModal';
import RecordsPanel from './components/RecordsPanel';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import TopBar from './components/TopBar';
import './styles.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [objects, setObjects] = useState([]);
  const [activeObject, setActiveObject] = useState('Account');
  const [records, setRecords] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const sentinelRef = useRef(null);

  const config = objects.find((item) => item.name === activeObject);
  const activeLabel = config?.label || 'Accounts';
  const Icon = objectIcons[activeObject] || Activity;

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const loadRecords = useCallback(async (objectName, reset = true) => {
    if (!session?.authenticated) {
      setRecords([]);
      setLoading(false);
      return;
    }

    if (reset) setLoading(true);
    else setLoadingMore(true);

    const path = reset
      ? `/api/records/${objectName}`
      : `/api/records/${objectName}/next?cursor=${encodeURIComponent(cursor)}`;

    try {
      const result = await api(path);
      setRecords((current) => reset ? result.records : [...current, ...result.records]);
      setCursor(result.nextRecordsUrl || null);
      setTotal(result.totalSize || 0);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, notify, session?.authenticated]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [currentSession, availableObjects] = await Promise.all([
          api('/api/session'),
          api('/api/objects'),
        ]);
        setSession(currentSession);
        setObjects(availableObjects);
      } catch (error) {
        setSession({ authenticated: false });
        try {
          setObjects(await api('/api/objects'));
        } catch (objectError) {
          notify(objectError.message || error.message, 'error');
        }
      }
    }

    loadInitialData();
  }, [notify]);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get('authError');
    if (!authError) return;

    notify(authError, 'error');
    window.history.replaceState({}, '', window.location.pathname);
  }, [notify]);

  useEffect(() => {
    setSearch('');
    loadRecords(activeObject, true);
  }, [activeObject, session?.authenticated]);

  useEffect(() => {
    if (!sentinelRef.current || !cursor || loading || loadingMore || !session?.authenticated) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadRecords(activeObject, false);
    }, { rootMargin: '180px' });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [activeObject, cursor, loadRecords, loading, loadingMore, session?.authenticated]);

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase();
    return records.filter((record) => config?.fields.some((field) => (
      displayValue(getFieldValue(record, field)).toLowerCase().includes(query)
    )));
  }, [config, records, search]);

  async function openRecord(kind, selectedRecord = null) {
    let record = selectedRecord;

    if (record && kind !== 'create') {
      setBusy(true);
      try {
        record = await api(`/api/records/${activeObject}/${record.Id}`);
      } catch (error) {
        notify(error.message, 'error');
        setBusy(false);
        return;
      }
      setBusy(false);
    }

    const values = Object.fromEntries(
      config.formFields.map((field) => [field, record?.[field] ?? '']),
    );
    setModal({ kind, record, values });
  }

  async function saveRecord(event) {
    event.preventDefault();
    setBusy(true);

    const values = Object.fromEntries(
      Object.entries(modal.values).map(([field, value]) => [
        field,
        typeof value === 'string' ? value.trim() : value,
      ]),
    );

    try {
      if (modal.kind === 'create') {
        await api(`/api/records/${activeObject}`, {
          method: 'POST',
          body: JSON.stringify(values),
        });
      } else {
        await api(`/api/records/${activeObject}/${modal.record.Id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });
      }

      setModal(null);
      const action = modal.kind === 'create' ? 'created' : 'updated';
      notify(`${activeLabel.slice(0, -1)} ${action}.`);
      await loadRecords(activeObject, true);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord(record) {
    const label = displayValue(record.Name || record.Subject || record.CaseNumber || record.Id);
    if (!window.confirm(`Delete “${label}”? This action cannot be undone.`)) return;

    try {
      await api(`/api/records/${activeObject}/${record.Id}`, { method: 'DELETE' });
      notify(`${activeLabel.slice(0, -1)} deleted.`);
      setRecords((current) => current.filter((item) => item.Id !== record.Id));
      setTotal((current) => Math.max(0, current - 1));
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function updateModalField(field, value) {
    setModal((current) => ({
      ...current,
      values: { ...current.values, [field]: value },
    }));
  }

  return (
    <div className="app-shell">
      <Sidebar
        objects={objects}
        activeObject={activeObject}
        onSelectObject={setActiveObject}
      />

      <main className="main-area">
        <TopBar
          activeLabel={activeLabel}
          session={session}
          onLogout={() => setSession({ authenticated: false })}
        />

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> SALESFORCE DATA</div>
              <h1>Good things happen<br className="mobile-break" /> when data <span>connects.</span></h1>
              <p>One workspace for the records that move your business forward.</p>
            </div>
            <div className="heading-decoration">
              <div className="decoration-orbit orbit-one" />
              <div className="decoration-orbit orbit-two" />
              <div className="decoration-core"><Icon size={27} /></div>
              <span className="orbit-dot dot-a" />
              <span className="orbit-dot dot-b" />
            </div>
          </section>

          <RecordsPanel
            config={config}
            activeObject={activeObject}
            activeLabel={activeLabel}
            objects={objects}
            Icon={Icon}
            session={session}
            records={records}
            filteredRecords={filteredRecords}
            total={total}
            cursor={cursor}
            loading={loading}
            loadingMore={loadingMore}
            search={search}
            sentinelRef={sentinelRef}
            onSelectObject={setActiveObject}
            onSearch={setSearch}
            onRefresh={() => loadRecords(activeObject, true)}
            onCreate={() => openRecord('create')}
            onView={(record) => openRecord('view', record)}
            onEdit={(record) => openRecord('edit', record)}
            onDelete={deleteRecord}
            onNextPage={() => loadRecords(activeObject, false)}
          />

          <footer className="app-footer">
            <span>Built for the way you work.</span>
            <span><span className="footer-spark">✦</span> Connected to Salesforce REST API</span>
          </footer>
        </div>
      </main>

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
      {modal && config && (
        <RecordModal
          modal={modal}
          config={config}
          activeLabel={activeLabel}
          Icon={Icon}
          busy={busy}
          onClose={() => setModal(null)}
          onEdit={(record) => openRecord('edit', record)}
          onChange={updateModalField}
          onSave={saveRecord}
        />
      )}
    </div>
  );
}
