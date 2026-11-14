import {
  Check,
  FilePlus2,
  LoaderCircle,
  Pencil,
  X,
} from 'lucide-react';
import { displayValue, formatFieldName, getFieldValue } from '../lib/format';

function RecordField({ field, config, value, onChange }) {
  const type = config.types[field] || 'text';
  const label = formatFieldName(field);
  const required = config.required.includes(field);
  const options = config.options?.[field];

  return (
    <label className="form-field">
      <span>{label}{required && <i> *</i>}</span>
      {options ? (
        <select
          required={required}
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input
          required={required}
          type={type}
          step={type === 'number' ? 'any' : undefined}
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
        />
      )}
    </label>
  );
}

export default function RecordModal({
  modal,
  config,
  activeLabel,
  Icon,
  busy,
  onClose,
  onEdit,
  onChange,
  onSave,
}) {
  const title = modal.kind === 'create'
    ? `Create ${activeLabel.slice(0, -1)}`
    : modal.record?.Name || modal.record?.Subject || modal.record?.CaseNumber || activeLabel.slice(0, -1);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="record-modal">
        <header className="modal-header">
          <div className="modal-heading-icon"><Icon size={19} /></div>
          <div>
            <div className="modal-kicker">
              {modal.kind === 'create' ? 'NEW RECORD' : modal.kind === 'edit' ? 'EDIT RECORD' : 'RECORD DETAILS'}
            </div>
            <h3>{title}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>

        {modal.kind === 'view' ? (
          <div className="detail-grid">
            {config.fields.map((field) => (
              <div className="detail-item" key={field}>
                <span>{formatFieldName(field)}</span>
                <strong>{displayValue(getFieldValue(modal.record, field))}</strong>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={onSave}>
            <div className="form-grid">
              {config.formFields.map((field) => (
                <RecordField
                  key={field}
                  field={field}
                  config={config}
                  value={modal.values[field] ?? ''}
                  onChange={onChange}
                />
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-button" disabled={busy}>
                {busy && <LoaderCircle size={15} className="spin" />}
                {modal.kind === 'create' ? <FilePlus2 size={15} /> : <Check size={15} />}
                {modal.kind === 'create' ? 'Create record' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {modal.kind === 'view' && (
          <div className="modal-actions">
            <button className="secondary-button" onClick={onClose}>Close</button>
            <button className="primary-button" onClick={() => onEdit(modal.record)}>
              <Pencil size={15} /> Edit record
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
