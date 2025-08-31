export interface DemographicQuestion {
  id: string;
  text: string;
  type: 'radio' | 'text' | 'other';
  options?: string[];
  required?: boolean;
}

export interface DemographicSurveyData {
  sampleCode: string;
  ageGroup: string;
  gender: string;
  maritalStatus: string;
  educationalQualification: string;
  educationalOther?: string;
  designation: string;
  incomeLevel: string;
  yearsExperience: string;
  workingUnit: string;
  workingUnitOther?: string;
  workShift: string;
  hoursPerDay: string;
  nightShiftsPerMonth: string;
  nightShiftsOther?: string;
  placeOfResidence: string;
  residenceOther?: string;
  contactNumber: string;
}

export const DEMOGRAPHIC_QUESTIONS: DemographicQuestion[] = [
  {
    id: 'sampleCode',
    text: 'Sample code No',
    type: 'text',
    required: true,
  },
  {
    id: 'ageGroup',
    text: 'Age group:',
    type: 'radio',
    options: [
      'Less than 20 years',
      '20-30 years',
      '31-35 years',
      'Above 35 years'
    ],
    required: true,
  },
  {
    id: 'gender',
    text: 'Gender:',
    type: 'radio',
    options: ['Male', 'Female'],
    required: true,
  },
  {
    id: 'maritalStatus',
    text: 'Marital status:',
    type: 'radio',
    options: [
      'Unmarried/Single',
      'Married',
      'Widower/Separated/divorced'
    ],
    required: true,
  },
  {
    id: 'educationalQualification',
    text: 'Educational qualification:',
    type: 'other',
    options: [
      'Certificate course',
      'Diploma',
      'Graduate',
      'Post Graduate',
      'Others'
    ],
    required: true,
  },
  {
    id: 'designation',
    text: 'Designation:',
    type: 'radio',
    options: [
      'Ward In-charge',
      'Staff Nurse',
      'Nurse in probation',
      'ANS'
    ],
    required: true,
  },
  {
    id: 'incomeLevel',
    text: 'Income level:',
    type: 'radio',
    options: [
      'Below Rs. 10,000',
      'Rs.10,001-Rs.20,000',
      'Rs.20,001-Rs.30,000',
      'Above Rs.30,000'
    ],
    required: true,
  },
  {
    id: 'yearsExperience',
    text: 'Year of experience:',
    type: 'radio',
    options: [
      'Less than 5 years',
      '5 – 10 years',
      '10 - 15 years',
      'Above 15 years'
    ],
    required: true,
  },
  {
    id: 'workingUnit',
    text: 'Working Unit:',
    type: 'other',
    options: [
      'Medical ward',
      'Surgical ward',
      'Obstetrics & Gynecology',
      'Pediatrics',
      'Geriatric',
      'Psychiatric',
      'OT',
      'Intensive care Units',
      'Post-operative units',
      'Any other'
    ],
    required: true,
  },
  {
    id: 'workShift',
    text: 'Work shift:',
    type: 'radio',
    options: [
      'Fixed/Morning',
      'Rotating'
    ],
    required: true,
  },
  {
    id: 'hoursPerDay',
    text: 'Hours worked per day:',
    type: 'radio',
    options: [
      '8 hours',
      '> 8 hours'
    ],
    required: true,
  },
  {
    id: 'nightShiftsPerMonth',
    text: 'No. of night shifts per month:',
    type: 'other',
    options: [
      'Weekly Once',
      '2 weeks once',
      'Monthly Once',
      'Others'
    ],
    required: true,
  },
  {
    id: 'placeOfResidence',
    text: 'Place of Residence:',
    type: 'other',
    options: [
      'Hostel in the Hospital Campus',
      'Hostel in Outside Hospital Campus',
      'Home',
      'PG Hostel',
      'Any other'
    ],
    required: true,
  },
  {
    id: 'contactNumber',
    text: 'Contact Number',
    type: 'text',
    required: true,
  },
];
