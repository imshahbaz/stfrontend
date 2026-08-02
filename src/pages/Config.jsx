import { useEffect, useState, useMemo } from 'react';
import {
  fetchClientConfig,
  fetchBackendConfig,
  reloadConfig,
  reloadClientConfig,
  updateConfig,
} from '../api/service';

function flattenEntries(obj, prefix = '') {
  let items = [];
  if (!obj || typeof obj !== 'object') return items;

  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const keyName = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && !Array.isArray(v)) {
      items = items.concat(flattenEntries(v, keyName));
    } else {
      items.push([keyName, v]);
    }
  }
  return items;
}

function ValueCell({ value, isSecret = false, onEditSubKey }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (value == null) return <span className="text-slate-500 font-mono text-xs">—</span>;

  // Boolean
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
          value
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-emerald-400' : 'bg-slate-500'}`} />
        {value ? 'Enabled' : 'Disabled'}
      </span>
    );
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-500 font-mono text-xs">—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span key={i} className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-xs text-blue-400">
            {item}
          </span>
        ))}
      </div>
    );
  }

  // Object
  if (typeof value === 'object') {
    const flatItems = flattenEntries(value);
    if (flatItems.length === 0) return <span className="text-slate-500 font-mono text-xs">—</span>;

    return (
      <div className="space-y-2 py-1 min-w-0 max-w-full overflow-hidden">
        {flatItems.map(([k, v]) => {
          const secretKey = isSecret || /key|secret|seed|password|token/i.test(k);
          return (
            <div
              key={k}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono rounded-lg bg-slate-950/80 px-3.5 py-2.5 border border-slate-800 min-w-0 overflow-hidden hover:border-slate-700 transition"
            >
              <span className="text-blue-400 font-semibold shrink-0">{k}:</span>
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <div className="text-slate-200 min-w-0 break-all overflow-hidden">
                  <ValueCell value={v} isSecret={secretKey} />
                </div>
                {onEditSubKey && (
                  <button
                    type="button"
                    onClick={() => onEditSubKey(k, v)}
                    className="text-slate-500 hover:text-blue-400 p-1 shrink-0 transition"
                    title={`Edit ${k} via dot-notation`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // String / Number
  const strVal = String(value);

  const handleCopy = () => {
    navigator.clipboard.writeText(strVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSecret) {
    const masked = '•'.repeat(Math.min(strVal.length, 14));
    return (
      <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 font-mono text-xs text-slate-200 min-w-0 overflow-hidden">
        <span className="truncate break-all">{revealed ? strVal : masked}</span>
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="text-slate-400 hover:text-slate-200 transition p-0.5 shrink-0"
          title={revealed ? 'Hide' : 'Reveal'}
        >
          {revealed ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.017 10.017 0 013.682-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-400 hover:text-blue-400 transition p-0.5 shrink-0"
          title="Copy"
        >
          {copied ? <span className="text-[10px] text-blue-400 font-semibold">Copied</span> : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex max-w-full items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1 font-mono text-xs text-slate-200 min-w-0 overflow-hidden">
      <span className="truncate break-all">{strVal}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-slate-500 hover:text-blue-400 transition p-0.5 shrink-0"
        title="Copy"
      >
        {copied ? <span className="text-[10px] text-blue-400 font-semibold">Copied</span> : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function FieldEditModal({ isOpen, onClose, configId, field, onSuccess }) {
  const [inputValue, setInputValue] = useState('');
  const [objectFields, setObjectFields] = useState({});
  const [objectUpdateMode, setObjectUpdateMode] = useState('DOT_NOTATION'); // 'DOT_NOTATION' | 'FULL_OBJECT'
  const [selectedSubKey, setSelectedSubKey] = useState('');
  const [subKeyValue, setSubKeyValue] = useState('');
  const [isRawJson, setIsRawJson] = useState(false);
  const [rawJsonStr, setRawJsonStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (!field) return;
    setError('');
    setShowSecret(false);

    if (field.fieldType === 'boolean') {
      setInputValue(Boolean(field.value));
    } else if (field.fieldType === 'number') {
      setInputValue(field.value != null ? Number(field.value) : 0);
    } else if (field.fieldType === 'array') {
      setInputValue(Array.isArray(field.value) ? field.value.join(', ') : String(field.value || ''));
    } else if (field.fieldType === 'object') {
      const obj = field.value && typeof field.value === 'object' ? field.value : {};
      setObjectFields({ ...obj });
      setRawJsonStr(JSON.stringify(obj, null, 2));

      const keys = Object.keys(obj);
      const initialSubKey = field.subKey || keys[0] || '';
      setSelectedSubKey(initialSubKey);
      setSubKeyValue(obj[initialSubKey] != null ? obj[initialSubKey] : '');

      if (field.subKey) {
        setObjectUpdateMode('DOT_NOTATION');
      } else {
        setObjectUpdateMode('DOT_NOTATION');
      }
      setIsRawJson(false);
    } else {
      setInputValue(field.value != null ? String(field.value) : '');
    }
  }, [field]);

  if (!isOpen || !field) return null;

  // Build the payload preview
  let payloadPreview = {};

  try {
    if (field.fieldType === 'boolean') {
      payloadPreview = { [field.key]: Boolean(inputValue) };
    } else if (field.fieldType === 'number') {
      payloadPreview = { [field.key]: Number(inputValue) };
    } else if (field.fieldType === 'array') {
      const arr = typeof inputValue === 'string'
        ? inputValue.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      payloadPreview = { [field.key]: arr };
    } else if (field.fieldType === 'object') {
      if (objectUpdateMode === 'DOT_NOTATION') {
        const keyName = selectedSubKey ? `${field.key}.${selectedSubKey}` : field.key;
        payloadPreview = { [keyName]: subKeyValue };
      } else {
        if (isRawJson) {
          payloadPreview = { [field.key]: JSON.parse(rawJsonStr || '{}') };
        } else {
          payloadPreview = { [field.key]: objectFields };
        }
      }
    } else {
      payloadPreview = { [field.key]: inputValue };
    }
  } catch (err) {
    payloadPreview = { [field.key]: '[Invalid format]' };
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let payload = {};
      if (field.fieldType === 'boolean') {
        payload = { [field.key]: Boolean(inputValue) };
      } else if (field.fieldType === 'number') {
        payload = { [field.key]: Number(inputValue) };
      } else if (field.fieldType === 'array') {
        const arr = typeof inputValue === 'string'
          ? inputValue.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        payload = { [field.key]: arr };
      } else if (field.fieldType === 'object') {
        if (objectUpdateMode === 'DOT_NOTATION') {
          if (!selectedSubKey.trim()) {
            throw new Error('Sub-key name cannot be empty');
          }
          const keyName = `${field.key}.${selectedSubKey.trim()}`;
          let parsedSubVal = subKeyValue;
          if (typeof objectFields[selectedSubKey] === 'number') {
            parsedSubVal = Number(subKeyValue);
          } else if (typeof objectFields[selectedSubKey] === 'boolean') {
            parsedSubVal = String(subKeyValue).toLowerCase() === 'true';
          }
          payload = { [keyName]: parsedSubVal };
        } else {
          if (isRawJson) {
            payload = { [field.key]: JSON.parse(rawJsonStr) };
          } else {
            payload = { [field.key]: objectFields };
          }
        }
      } else {
        payload = { [field.key]: inputValue };
      }

      await updateConfig(configId, payload);
      const displayKey = Object.keys(payload)[0];
      onSuccess(displayKey);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Edit {field.label}</h3>
              <p className="text-[11px] font-mono text-slate-400">PUT /api/admin/config/update/{configId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 font-mono">
              {error}
            </div>
          )}

          {/* Form Input based on fieldType */}
          {field.fieldType === 'boolean' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Setting State</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInputValue(true)}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition ${
                    inputValue === true
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Enabled (true)
                </button>
                <button
                  type="button"
                  onClick={() => setInputValue(false)}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition ${
                    inputValue === false
                      ? 'border-slate-600 bg-slate-800 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Disabled (false)
                </button>
              </div>
            </div>
          )}

          {field.fieldType === 'number' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">{field.label} Value</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          )}

          {field.fieldType === 'array' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">{field.label} (Comma Separated)</label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={3}
                placeholder="http://localhost:3000, http://example.com"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-blue-500 transition"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Separate multiple entries with commas. Empty entries will be ignored.
              </span>
            </div>
          )}

          {field.fieldType === 'object' && (
            <div className="space-y-4">
              {/* Strategy Switcher */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Update Format</label>
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1">
                  <button
                    type="button"
                    onClick={() => setObjectUpdateMode('DOT_NOTATION')}
                    className={`rounded-md py-1.5 px-3 text-xs font-semibold transition ${
                      objectUpdateMode === 'DOT_NOTATION'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sub-field ({field.key}.subKey)
                  </button>
                  <button
                    type="button"
                    onClick={() => setObjectUpdateMode('FULL_OBJECT')}
                    className={`rounded-md py-1.5 px-3 text-xs font-semibold transition ${
                      objectUpdateMode === 'FULL_OBJECT'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Complete {field.label}
                  </button>
                </div>
              </div>

              {objectUpdateMode === 'DOT_NOTATION' ? (
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Sub-field Key</label>
                    <select
                      value={selectedSubKey}
                      onChange={(e) => {
                        const k = e.target.value;
                        setSelectedSubKey(k);
                        setSubKeyValue(objectFields[k] != null ? objectFields[k] : '');
                      }}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-blue-500 transition"
                    >
                      {Object.keys(objectFields).map((k) => (
                        <option key={k} value={k}>
                          {field.key}.{k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Value for <span className="font-mono text-blue-400">{field.key}.{selectedSubKey || 'key'}</span>
                      </label>
                      {/key|secret|seed|password|token/i.test(selectedSubKey) && (
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                        >
                          {showSecret ? 'Hide Secret' : 'Show Secret'}
                        </button>
                      )}
                    </div>
                    <input
                      type={/key|secret|seed|password|token/i.test(selectedSubKey) && !showSecret ? 'password' : 'text'}
                      value={subKeyValue}
                      onChange={(e) => setSubKeyValue(e.target.value)}
                      placeholder={`Enter new value for ${field.key}.${selectedSubKey}...`}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Object Fields</label>
                    <button
                      type="button"
                      onClick={() => setIsRawJson(!isRawJson)}
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      {isRawJson ? 'Switch to Form View' : 'Switch to Raw JSON'}
                    </button>
                  </div>

                  {isRawJson ? (
                    <textarea
                      value={rawJsonStr}
                      onChange={(e) => setRawJsonStr(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-emerald-400 outline-none focus:border-blue-500 transition"
                    />
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {Object.keys(objectFields).length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No object properties defined.</p>
                      ) : (
                        Object.entries(objectFields).map(([subK, subV]) => (
                          <div key={subK} className="flex items-center gap-2">
                            <span className="w-36 shrink-0 font-mono text-xs text-blue-400 truncate">{subK}:</span>
                            <input
                              type={typeof subV === 'boolean' ? 'text' : typeof subV === 'number' ? 'number' : 'text'}
                              value={subV == null ? '' : typeof subV === 'boolean' ? String(subV) : subV}
                              onChange={(e) => {
                                let val = e.target.value;
                                if (typeof subV === 'boolean') {
                                  val = val.toLowerCase() === 'true';
                                } else if (typeof subV === 'number') {
                                  val = Number(val);
                                }
                                setObjectFields({ ...objectFields, [subK]: val });
                              }}
                              className="flex-1 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-blue-500 transition"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {field.fieldType === 'string' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">{field.label}</label>
                {field.isSecret && (
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    {showSecret ? 'Hide Value' : 'Show Value'}
                  </button>
                )}
              </div>
              <input
                type={field.isSecret && !showSecret ? 'password' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter new ${field.label}...`}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          )}

          {/* Payload Preview */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>API Request Payload Body</span>
              <span className="text-blue-400">JSON</span>
            </div>
            <pre className="font-mono text-[11px] text-emerald-400 bg-slate-900/60 p-2.5 rounded-lg overflow-x-auto border border-slate-800/50">
              {JSON.stringify(payloadPreview, null, 2)}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminConfigTable({ title, badgeText, config, searchQuery, onEditField }) {
  if (!config) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="font-bold text-slate-200">{title}</h3>
        <p className="mt-4 text-xs text-slate-500">No configuration data loaded.</p>
      </div>
    );
  }

  const items = [
    { label: 'Config ID', key: 'id', value: config.id, editable: false, fieldType: 'string' },
    { label: 'Allowed Frontend URLs', key: 'frontendUrls', value: config.frontendUrls, editable: true, fieldType: 'array' },
    { label: 'Leverage Limit', key: 'leverage', value: config.leverage, editable: true, fieldType: 'number' },
    { label: 'Debug Mode', key: 'debugMode', value: config.debugMode, editable: true, fieldType: 'boolean' },
    { label: 'Rate Limiter', key: 'rateLimiter', value: config.rateLimiter, editable: true, fieldType: 'boolean' },
    { label: 'Redis Database URL', key: 'redisUrl', value: config.redisUrl, editable: true, fieldType: 'string' },
    { label: 'JWT Secret Key', key: 'jwtSecret', value: config.jwtSecret, isSecret: true, editable: true, fieldType: 'string' },
    { label: 'API Key', key: 'apiKey', value: config.apiKey, isSecret: true, editable: true, fieldType: 'string' },
    { label: 'Brevo Sender Email', key: 'brevoEmail', value: config.brevoEmail, editable: true, fieldType: 'string' },
    { label: 'Brevo API Key', key: 'brevoApiKey', value: config.brevoApiKey, isSecret: true, editable: true, fieldType: 'string' },
    { label: 'Auth Providers', key: 'auth', value: config.auth, editable: true, fieldType: 'object' },
    { label: 'Angel One Broker', key: 'angelOneConfig', value: config.angelOneConfig, editable: true, fieldType: 'object' },
    { label: 'Google OAuth & Gemini', key: 'googleAuth', value: config.googleAuth, editable: true, fieldType: 'object' },
    { label: 'FCM Push Config', key: 'fcmConfig', value: config.fcmConfig, editable: true, fieldType: 'object' },
    { label: 'Component Flags', key: 'components', value: config.components, editable: true, fieldType: 'object' },
  ].filter((item) => item.value != null);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const valStr = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value);
    return item.label.toLowerCase().includes(q) || item.key.toLowerCase().includes(q) || valStr.toLowerCase().includes(q);
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
      {/* Table Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-blue-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">{title}</h3>
            <p className="text-[11px] text-slate-500">{filteredItems.length} configuration fields</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
          {badgeText}
        </span>
      </div>

      {/* Admin Property Table */}
      <div className="divide-y divide-slate-800/70">
        {filteredItems.map((item) => (
          <div
            key={item.key}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-slate-800/40 transition group"
          >
            <div className="md:col-span-4">
              <span className="text-xs font-semibold text-slate-200 block">{item.label}</span>
              <span className="text-[10px] font-mono text-slate-500">{item.key}</span>
            </div>

            <div className="md:col-span-8 flex items-center justify-between gap-4 min-w-0 overflow-hidden">
              <div className="min-w-0 flex-1 overflow-hidden">
                <ValueCell
                  value={item.value}
                  isSecret={item.isSecret}
                  onEditSubKey={item.editable ? (subK) => onEditField(item, subK) : undefined}
                />
              </div>

              {item.editable && (
                <button
                  type="button"
                  onClick={() => onEditField(item)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 font-medium px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-blue-500/10 hover:border-blue-500/30 transition shrink-0"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Config() {
  const [client, setClient] = useState(null);
  const [backend, setBackend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('BACKEND'); // 'BACKEND' | 'CLIENT'
  const [reloadNotice, setReloadNotice] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Field Edit Modal State
  const [editingField, setEditingField] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientData, backendData] = await Promise.all([
        fetchClientConfig(),
        fetchBackendConfig(),
      ]);
      setClient(clientData);
      setBackend(backendData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const [reloadingClient, setReloadingClient] = useState(false);

  async function handleReloadBackend() {
    if (reloading || loading) return;
    setReloading(true);
    setReloadNotice('');
    try {
      await reloadConfig();
      await loadConfig();
      setReloadNotice('Backend configuration successfully reloaded from server!');
      setTimeout(() => setReloadNotice(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload backend configuration');
    } finally {
      setReloading(false);
    }
  }

  async function handleReloadClient() {
    if (reloadingClient || loading) return;
    setReloadingClient(true);
    setReloadNotice('');
    try {
      await reloadClientConfig();
      await loadConfig();
      setReloadNotice('Client configuration successfully reloaded!');
      setTimeout(() => setReloadNotice(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload client configuration');
    } finally {
      setReloadingClient(false);
    }
  }

  const handleEditField = (fieldItem, subKey = null) => {
    setEditingField({
      ...fieldItem,
      subKey,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveSuccess = async (updatedKey) => {
    setSuccessNotice(`Field "${updatedKey}" updated successfully!`);
    setTimeout(() => setSuccessNotice(''), 4000);
    await loadConfig();
  };

  const currentConfig = activeTab === 'BACKEND' ? backend : client;
  const configId = currentConfig?.id || backend?.id || client?.id || 'active';

  // Calculate high-level admin metrics
  const adminStats = useMemo(() => {
    const leverage = backend?.leverage || client?.leverage || 10;
    const rateLimiter = backend?.rateLimiter ?? client?.rateLimiter ?? true;
    const debugMode = backend?.debugMode ?? client?.debugMode ?? false;
    const googleAuth = backend?.auth?.google ?? client?.auth?.google ?? true;
    const angelConfigured = Boolean(backend?.angelOneConfig || client?.angelOneConfig);

    return { leverage, rateLimiter, debugMode, googleAuth, angelConfigured };
  }, [backend, client]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Configuration Management</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Admin control panel for client and backend runtime environment variables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReloadBackend}
            disabled={reloading || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
            title="POST /api/admin/config/reload"
          >
            <svg
              className={`h-4 w-4 ${reloading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {reloading ? 'Reloading Backend...' : 'Reload Backend Config'}
          </button>

          <button
            type="button"
            onClick={handleReloadClient}
            disabled={reloadingClient || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600/20 px-4 py-2.5 text-xs font-semibold text-indigo-300 shadow-sm transition hover:bg-indigo-600/30 hover:border-indigo-500/60 disabled:opacity-50"
            title="POST /api/admin/config/client/reload"
          >
            <svg
              className={`h-4 w-4 ${reloadingClient ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {reloadingClient ? 'Reloading Client...' : 'Reload Client Config'}
          </button>
        </div>
      </div>

      {reloadNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {reloadNotice}
        </div>
      )}

      {successNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successNotice}
        </div>
      )}

      {/* Admin Quick Stat Overview Bar */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-medium">Trading Leverage</span>
          <p className="mt-2 text-2xl font-bold text-white font-mono">{adminStats.leverage}x</p>
          <span className="text-[11px] text-slate-500">Max account multiplier</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-medium">Rate Limiter</span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                adminStats.rateLimiter
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${adminStats.rateLimiter ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {adminStats.rateLimiter ? 'Active' : 'Disabled'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">API Request Throttle</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-medium">Angel One Broker</span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                adminStats.angelConfigured
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {adminStats.angelConfigured ? 'Configured' : 'Not Set'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Broker API integration</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-medium">Debug Mode</span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                adminStats.debugMode
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {adminStats.debugMode ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">System verbose logs</span>
        </div>
      </div>

      {/* Search Bar & View Filter Tabs */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab('BACKEND')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'BACKEND'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Backend Config
          </button>
          <button
            onClick={() => setActiveTab('CLIENT')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'CLIENT'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Client Config
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parameters or values..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="h-96 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <p className="font-semibold">Error:</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      )}

      {/* Admin Config Table */}
      {!loading && (
        <div className="space-y-6">
          {activeTab === 'BACKEND' && (
            <AdminConfigTable
              title="Backend Active Configuration"
              badgeText="Backend API"
              config={backend}
              searchQuery={searchQuery}
              onEditField={handleEditField}
            />
          )}

          {activeTab === 'CLIENT' && (
            <AdminConfigTable
              title="Client Active Configuration"
              badgeText="Client Web App"
              config={client}
              searchQuery={searchQuery}
              onEditField={handleEditField}
            />
          )}
        </div>
      )}

      {/* Field Edit Modal */}
      <FieldEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        configId={configId}
        field={editingField}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
}
