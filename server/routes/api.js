import { Router } from 'express';
import { apiVersion } from '../config.js';
import { getFormFields, objects } from '../objects.js';
import { cleanError, recordEndpoint, salesforceRequest } from '../salesforce.js';

const router = Router();

function getObject(name, res) {
  const config = objects[name];
  if (!config) res.status(404).json({ error: 'Unsupported Salesforce object.' });
  return config;
}

function allowedFields(config, body) {
  return config.editable.reduce((fields, key) => {
    if (body[key] !== undefined) fields[key] = body[key];
    return fields;
  }, {});
}

router.get('/session', async (req, res) => {
  try {
    if (!req.session.salesforce) return res.json({ authenticated: false });
    const profile = await salesforceRequest(req, '/services/oauth2/userinfo');
    res.json({
      authenticated: true,
      user: {
        name: profile.name,
        email: profile.email,
        username: profile.preferred_username,
      },
      instanceUrl: req.session.salesforce.instanceUrl,
    });
  } catch (error) {
    res.status(401).json({ error: cleanError(error) });
  }
});

router.get('/objects', (_req, res) => {
  const availableObjects = Object.entries(objects).map(([name, config]) => ({
    name,
    label: config.label,
    fields: config.fields,
    editable: config.editable,
    formFields: getFormFields(config),
    required: config.required,
    types: config.types,
    options: config.options || {},
  }));
  res.json(availableObjects);
});

router.get('/records/:object/next', async (req, res) => {
  try {
    if (!getObject(req.params.object, res)) return;

    const cursor = String(req.query.cursor || '');
    const expectedPrefix = `/services/data/${apiVersion}/query/`;
    if (!cursor.startsWith(expectedPrefix) || cursor.includes('://')) {
      return res.status(400).json({ error: 'Invalid pagination cursor.' });
    }

    const result = await salesforceRequest(req, cursor);
    res.json({
      records: result.records,
      nextRecordsUrl: result.nextRecordsUrl || null,
      totalSize: result.totalSize,
    });
  } catch (error) {
    res.status(400).json({ error: cleanError(error) });
  }
});

router.get('/records/:object', async (req, res) => {
  try {
    const config = getObject(req.params.object, res);
    if (!config) return;

    const fields = ['Id', ...config.fields.filter((field) => !field.includes('.'))];
    const accountField = config.fields.includes('Account.Name') ? ', Account.Name' : '';
    const query = `SELECT ${fields.join(', ')}${accountField} FROM ${req.params.object} ORDER BY CreatedDate DESC LIMIT 20`;
    const result = await salesforceRequest(req, `/services/data/${apiVersion}/query?q=${encodeURIComponent(query)}`);

    res.json({
      records: result.records,
      nextRecordsUrl: result.nextRecordsUrl || null,
      totalSize: result.totalSize,
    });
  } catch (error) {
    res.status(400).json({ error: cleanError(error) });
  }
});

router.get('/records/:object/:id', async (req, res) => {
  try {
    const config = getObject(req.params.object, res);
    if (!config) return;

    const fields = [...new Set([...config.fields, ...getFormFields(config)])]
      .filter((field) => !field.includes('.'));
    const endpoint = `${recordEndpoint(req.params.object, req.params.id)}?fields=${encodeURIComponent(fields.join(','))}`;
    res.json(await salesforceRequest(req, endpoint));
  } catch (error) {
    res.status(400).json({ error: cleanError(error) });
  }
});

router.post('/records/:object', async (req, res) => {
  try {
    const config = getObject(req.params.object, res);
    if (!config) return;

    const fields = allowedFields(config, req.body);
    for (const field of config.required) {
      if (!fields[field]) return res.status(400).json({ error: `${field} is required.` });
    }

    const endpoint = `/services/data/${apiVersion}/sobjects/${req.params.object}`;
    const result = await salesforceRequest(req, endpoint, {
      method: 'POST',
      body: JSON.stringify(fields),
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: cleanError(error) });
  }
});

router.patch('/records/:object/:id', async (req, res) => {
  try {
    const config = getObject(req.params.object, res);
    if (!config) return;

    const endpoint = recordEndpoint(req.params.object, req.params.id);
    await salesforceRequest(req, endpoint, {
      method: 'PATCH',
      body: JSON.stringify(allowedFields(config, req.body)),
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: cleanError(error) });
  }
});

router.delete('/records/:object/:id', async (req, res) => {
  try {
    if (!getObject(req.params.object, res)) return;
    await salesforceRequest(req, recordEndpoint(req.params.object, req.params.id), { method: 'DELETE' });
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: cleanError(error) });
  }
});

export default router;
