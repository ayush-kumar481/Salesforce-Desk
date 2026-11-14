import { Filter, RefreshCw, Search } from 'lucide-react';

export default function RecordsToolbar({
  total,
  loadedCount,
  objectName,
  search,
  onSearch,
  onRefresh,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="record-count">
          <span className="count-indicator" />
          {total.toLocaleString()} <span>records</span>
        </div>
        <span className="toolbar-divider" />
        <span className="showing">Showing {loadedCount} of {total.toLocaleString()}</span>
      </div>
      <div className="toolbar-right">
        <label className="search-box">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={`Search ${objectName}...`}
            aria-label={`Search ${objectName}`}
          />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button" title="Refresh records" onClick={onRefresh}>
          <RefreshCw size={15} />
        </button>
        <button className="filter-button"><Filter size={15} /> Filter</button>
      </div>
    </div>
  );
}
