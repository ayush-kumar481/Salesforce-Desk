export function formatFieldName(field) {
  return field
    .replaceAll('.', ' / ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function getFieldValue(record, field) {
  return field.split('.').reduce((value, part) => value?.[part], record);
}

export function displayValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'object') {
    return value.Name || value.attributes?.url || JSON.stringify(value);
  }
  return String(value);
}
