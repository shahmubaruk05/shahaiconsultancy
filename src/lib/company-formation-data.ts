export type Guide = {
  formationSteps: string[];
  documentChecklist: string[];
  notes: string[];
};

export const usaGuide: Guide = {
  formationSteps: [
    'Choose a business name and check for availability.',
    'Decide on a business structure (e.g., LLC, C-Corp, S-Corp).',
    'File formation documents with the Secretary of State in your chosen state (e.g., Articles of Organization for an LLC).',
    'Appoint a registered agent.',
    'Obtain an Employer Identification Number (EIN) from the IRS.',
    'Open a business bank account.',
    'Obtain necessary federal, state, and local licenses and permits.',
  ],
  documentChecklist: [
    'Formation Document (e.g., Articles of Organization)',
    'Operating Agreement (for LLCs) or Bylaws (for Corporations)',
    'EIN Confirmation Letter',
    'Business Licenses and Permits',
    'Statement of the Incorporator',
  ],
  notes: [
    'Requirements can vary significantly by state.',
    'LLCs offer liability protection and pass-through taxation.',
    'C-Corps are standard for venture-backed startups but involve double taxation.',
    'Consult with a legal professional to choose the right structure for your business.',
  ],
};

export const bangladeshGuide: Guide = {
  formationSteps: [
    'Obtain Name Clearance Certificate from the Registrar of Joint Stock Companies and Firms (RJSC).',
    'Draft and sign the Memorandum of Association (MoA) and Articles of Association (AoA).',
    'Open a temporary bank account for the proposed company and remit the paid-up capital.',
    'Submit all required documents to the RJSC for incorporation.',
    'Obtain Certificate of Incorporation from RJSC.',
    'Obtain Trade License, Tax Identification Number (TIN), and VAT Registration Certificate.',
  ],
  documentChecklist: [
    'Name Clearance Certificate',
    'Memorandum of Association (MoA)',
    'Articles of Association (AoA)',
    'Scanned copies of National ID/Passport for shareholders and directors',
    'Bank encashment certificate for foreign investment',
    'Form IX (Consent of director)',
  ],
  notes: [
    'Private Limited Company is the most common structure for startups.',
    'Minimum of two shareholders and two directors are required.',
    'The process can be completed online through the RJSC portal.',
    'It is highly recommended to engage a local law firm or consultancy for a smooth process.',
  ],
};
