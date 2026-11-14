export const objects = {
  Account: {
    label: 'Accounts',
    fields: ['Name', 'Type', 'Industry', 'Phone', 'Website', 'BillingCity'],
    editable: ['Name', 'Type', 'Industry', 'Phone', 'Website', 'BillingCity'],
    required: ['Name'],
    types: {
      Name: 'text', Type: 'select', Industry: 'select', Phone: 'tel',
      Website: 'url', BillingCity: 'text',
    },
    options: {
      Type: ['Analyst', 'Competitor', 'Customer', 'Integrator', 'Investor', 'Partner', 'Press', 'Prospect', 'Reseller', 'Other'],
      Industry: [
        'Agriculture', 'Apparel', 'Banking', 'Biotechnology', 'Chemicals',
        'Communications', 'Construction', 'Consulting', 'Education', 'Electronics',
        'Energy', 'Engineering', 'Entertainment', 'Environmental', 'Finance',
        'Food & Beverage', 'Government', 'Healthcare', 'Hospitality', 'Insurance',
        'Machinery', 'Manufacturing', 'Media', 'Not For Profit', 'Recreation',
        'Retail', 'Shipping', 'Technology', 'Telecommunications', 'Transportation',
        'Utilities', 'Other',
      ],
    },
  },
  Opportunity: {
    label: 'Opportunities',
    fields: ['Name', 'StageName', 'Amount', 'CloseDate', 'Type', 'Probability'],
    editable: ['Name', 'StageName', 'Amount', 'CloseDate', 'Type'],
    required: ['Name', 'StageName', 'CloseDate'],
    types: {
      Name: 'text', StageName: 'select', Amount: 'number',
      CloseDate: 'date', Type: 'select', Probability: 'number',
    },
    options: {
      StageName: [
        'Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition',
        'Id. Decision Makers', 'Perception Analysis', 'Proposal/Price Quote',
        'Negotiation/Review', 'Closed Won', 'Closed Lost',
      ],
      Type: ['Existing Business', 'New Business'],
    },
  },
  Lead: {
    label: 'Leads',
    fields: ['Name', 'Company', 'Title', 'Email', 'Phone', 'Status'],
    editable: ['FirstName', 'LastName', 'Company', 'Title', 'Email', 'Phone', 'Status'],
    formFields: ['FirstName', 'LastName', 'Company', 'Title', 'Email', 'Phone', 'Status'],
    required: ['LastName', 'Company'],
    types: {
      FirstName: 'text', LastName: 'text', Company: 'text', Title: 'text',
      Email: 'email', Phone: 'tel', Status: 'select', Name: 'text',
    },
    options: {
      Status: ['Open - Not Contacted', 'Working - Contacted', 'Closed - Converted', 'Closed - Not Converted'],
    },
  },
  Contact: {
    label: 'Contacts',
    fields: ['Name', 'Title', 'Account.Name', 'Email', 'Phone', 'Department'],
    editable: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'Department'],
    formFields: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'Department'],
    required: ['LastName'],
    types: {
      FirstName: 'text', LastName: 'text', Title: 'text', Email: 'email',
      Phone: 'tel', Department: 'text',
    },
  },
  Case: {
    label: 'Cases',
    fields: ['CaseNumber', 'Subject', 'Status', 'Priority', 'Origin', 'Type'],
    editable: ['Subject', 'Status', 'Priority', 'Origin', 'Type'],
    required: ['Subject', 'Status', 'Origin'],
    types: {
      CaseNumber: 'text', Subject: 'text', Status: 'select', Priority: 'select',
      Origin: 'select', Type: 'select',
    },
    options: {
      Status: ['New', 'Working', 'Escalated', 'Closed'],
      Priority: ['High', 'Medium', 'Low'],
      Origin: ['Email', 'Phone', 'Web'],
    },
  },
};

export function getFormFields(config) {
  return config.formFields || config.fields.filter((field) => config.editable.includes(field));
}
