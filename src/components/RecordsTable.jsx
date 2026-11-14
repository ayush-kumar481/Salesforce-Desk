import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { displayValue, formatFieldName, getFieldValue } from '../lib/format';

function RecordCell({ record, field, index, onView }) {
  const value = getFieldValue(record, field);

  if (index === 0) {
    return (
      <button className="record-name" onClick={() => onView(record)}>
        {field === 'Name' ? displayValue(value) : (
          <>
            {displayValue(value)}
            <span className="id-subtext">{record.Id?.slice(-8)}</span>
          </>
        )}
      </button>
    );
  }

  if (['Status', 'StageName', 'Priority'].includes(field)) {
    const statusClass = String(value).toLowerCase().replaceAll(' ', '-');
    return <span className={`status-chip ${statusClass}`}>{displayValue(value)}</span>;
  }

  if (field === 'Amount') {
    const amount = value == null
      ? '—'
      : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);

    return <span className="amount-cell">{amount}</span>;
  }

  return <span className="cell-value">{displayValue(value)}</span>;
}

export default function RecordsTable({
  config,
  records,
  filteredRecords,
  loading,
  loadingMore,
  cursor,
  total,
  sentinelRef,
  onView,
  onEdit,
  onDelete,
  onNextPage,
}) {
  const emptyMessage = records.length
    ? 'No matching records found.'
    : 'No records yet. Create one to get started.';

  return (
    <>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="check-col"><input type="checkbox" aria-label="Select all visible records" /></th>
              {config?.fields.map((field, index) => (
                <th key={field}>
                  {formatFieldName(field)}
                  {index === 0 && <ArrowDownUp size={12} className="sort-icon" />}
                </th>
              ))}
              <th className="actions-head">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="table-state" colSpan={(config?.fields.length || 5) + 2}>
                  <LoaderCircle className="spin" size={19} /> Loading records…
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td className="table-state" colSpan={(config?.fields.length || 5) + 2}>
                  <Search size={18} /> {emptyMessage}
                </td>
              </tr>
            ) : filteredRecords.map((record, rowIndex) => (
              <tr key={record.Id}>
                <td className="check-col">
                  <input type="checkbox" aria-label={`Select record ${rowIndex + 1}`} />
                </td>
                {config.fields.map((field, index) => (
                  <td key={field}>
                    <RecordCell record={record} field={field} index={index} onView={onView} />
                  </td>
                ))}
                <td>
                  <div className="row-actions">
                    <button title="View record" onClick={() => onView(record)}><Eye size={15} /></button>
                    <button title="Edit record" onClick={() => onEdit(record)}><Pencil size={15} /></button>
                    <button title="Delete record" className="delete-action" onClick={() => onDelete(record)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={sentinelRef} className="load-more">
        {loadingMore ? (
          <><LoaderCircle size={15} className="spin" /> Loading the next 20 records…</>
        ) : cursor ? (
          <span>Scroll to load more <ArrowRight size={13} /></span>
        ) : records.length > 0 ? (
          <span>All {total.toLocaleString()} records loaded</span>
        ) : null}
      </div>

      <div className="panel-footer">
        <div className="footer-info">
          <span className="footer-check"><Check size={11} /></span>
          Connected to Salesforce <span className="footer-bullet">·</span> Synced just now
        </div>
        <div className="pagination-note">
          Showing <strong>{records.length ? 1 : 0}–{records.length}</strong>
          {' '}of <strong>{total.toLocaleString()}</strong>
          <span className="page-arrows">
            <button disabled aria-label="Previous page"><ArrowLeft size={13} /></button>
            <button disabled={!cursor} onClick={onNextPage} aria-label="Load next page">
              <ArrowRight size={13} />
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
