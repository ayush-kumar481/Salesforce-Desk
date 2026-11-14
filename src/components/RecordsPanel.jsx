import { ChevronDown, Plus } from 'lucide-react';
import ConnectionEmpty from './ConnectionEmpty';
import RecordsTable from './RecordsTable';
import RecordsToolbar from './RecordsToolbar';

export default function RecordsPanel({
  config,
  activeObject,
  activeLabel,
  objects,
  Icon,
  session,
  records,
  filteredRecords,
  total,
  cursor,
  loading,
  loadingMore,
  search,
  sentinelRef,
  onSelectObject,
  onSearch,
  onRefresh,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onNextPage,
}) {
  return (
    <section className="records-panel">
      <div className="panel-topline">
        <div className="panel-title">
          <div className="object-icon"><Icon size={19} /></div>
          <div>
            <h2>{activeLabel}</h2>
            <p>Browse and manage your {activeObject.toLowerCase()} records</p>
          </div>
        </div>
        <div className="panel-controls">
          <div className="select-wrap">
            <select
              value={activeObject}
              aria-label="Choose Salesforce object"
              onChange={(event) => onSelectObject(event.target.value)}
            >
              {objects.map((item) => <option value={item.name} key={item.name}>{item.label}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
          <button className="primary-button" onClick={onCreate} disabled={!session?.authenticated}>
            <Plus size={16} /> New {config?.label?.slice(0, -1) || 'Record'}
          </button>
        </div>
      </div>

      {!session?.authenticated ? (
        <ConnectionEmpty Icon={Icon} />
      ) : (
        <>
          <RecordsToolbar
            total={total}
            loadedCount={records.length}
            objectName={activeObject.toLowerCase()}
            search={search}
            onSearch={onSearch}
            onRefresh={onRefresh}
          />
          <RecordsTable
            config={config}
            records={records}
            filteredRecords={filteredRecords}
            loading={loading}
            loadingMore={loadingMore}
            cursor={cursor}
            total={total}
            sentinelRef={sentinelRef}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onNextPage={onNextPage}
          />
        </>
      )}
    </section>
  );
}
