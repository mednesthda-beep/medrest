export interface LabParameter {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  insight?: string;
}

export interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  purpose?: string;
}

export interface MedicalAnalysisResult {
  patientName?: string;
  reportDate?: string;
  reportType: string;
  overallStatus: 'normal' | 'attention' | 'critical';
  diagnosisSummary: string;
  labParameters: LabParameter[];
  medications: ExtractedMedication[];
  doctorAdvice: string[];
  rawText: string;
}

// Known common lab test definitions with typical normal ranges
const KNOWN_LAB_TESTS = [
  {
    regex: /(?:fasting\s*(?:blood\s*)?glucose|fasting\s*blood\s*sugar|fbs)/i,
    name: 'Fasting Blood Glucose',
    unit: 'mg/dL',
    min: 70,
    max: 100,
    criticalHigh: 200,
    criticalLow: 55,
    insight: 'Indicates baseline blood sugar control.',
  },
  {
    regex: /(?:post\s*prandial\s*(?:blood\s*)?glucose|ppbs|post\s*meal\s*sugar)/i,
    name: 'Post-Prandial Glucose (PPBS)',
    unit: 'mg/dL',
    min: 70,
    max: 140,
    criticalHigh: 250,
    criticalLow: 60,
    insight: 'Reflects insulin response after a meal.',
  },
  {
    regex: /(?:hba1c|glycated\s*hemoglobin)/i,
    name: 'HbA1c (Glycated Hemoglobin)',
    unit: '%',
    min: 4.0,
    max: 5.6,
    criticalHigh: 8.5,
    criticalLow: 3.5,
    insight: '3-month average blood glucose marker.',
  },
  {
    regex: /(?:hemoglobin|hgb|hb\b)/i,
    name: 'Hemoglobin (Hb)',
    unit: 'g/dL',
    min: 12.0,
    max: 16.5,
    criticalHigh: 20.0,
    criticalLow: 8.0,
    insight: 'Crucial for oxygen transport throughout the body.',
  },
  {
    regex: /(?:wbc|white\s*blood\s*cells?|total\s*leukocyte\s*count|tlc)/i,
    name: 'Total WBC Count',
    unit: 'cells/mcL',
    min: 4000,
    max: 11000,
    criticalHigh: 20000,
    criticalLow: 2500,
    insight: 'Primary marker for immune activity and infection.',
  },
  {
    regex: /(?:platelets?|platelet\s*count)/i,
    name: 'Platelet Count',
    unit: 'lakh/mcL',
    min: 1.5,
    max: 4.5,
    criticalHigh: 6.0,
    criticalLow: 0.8,
    insight: 'Essential for normal blood clotting.',
  },
  {
    regex: /(?:blood\s*pressure|bp\b)/i,
    name: 'Blood Pressure',
    unit: 'mmHg',
    min: 90,
    max: 130,
    criticalHigh: 160,
    criticalLow: 80,
    insight: 'Cardiovascular hemodynamic pressure.',
  },
  {
    regex: /(?:total\s*cholesterol)/i,
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    min: 120,
    max: 200,
    criticalHigh: 240,
    criticalLow: 100,
    insight: 'Lipid profile cardiovascular risk indicator.',
  },
  {
    regex: /(?:serum\s*creatinine|creatinine)/i,
    name: 'Serum Creatinine',
    unit: 'mg/dL',
    min: 0.6,
    max: 1.2,
    criticalHigh: 2.5,
    criticalLow: 0.4,
    insight: 'Kidney filtration and renal function benchmark.',
  },
  {
    regex: /(?:body\s*temperature|temp(?:erature)?)/i,
    name: 'Body Temperature',
    unit: '°C',
    min: 36.1,
    max: 37.3,
    criticalHigh: 39.0,
    criticalLow: 35.0,
    insight: 'Core thermal homeostatic indicator.',
  },
];

// Common medical prescription keywords
const COMMON_MEDICATIONS = [
  { name: 'Metformin', defaultDose: '500 mg', purpose: 'Blood Sugar Regulation' },
  { name: 'Paracetamol', defaultDose: '650 mg', purpose: 'Fever & Pain Relief' },
  { name: 'Telmisartan', defaultDose: '40 mg', purpose: 'Blood Pressure Management' },
  { name: 'Amlodipine', defaultDose: '5 mg', purpose: 'Hypertension Treatment' },
  { name: 'Atorvastatin', defaultDose: '10 mg', purpose: 'Lipid / Cholesterol Control' },
  { name: 'Amoxicillin', defaultDose: '500 mg', purpose: 'Antibiotic for Bacterial Infection' },
  { name: 'Pantoprazole', defaultDose: '40 mg', purpose: 'Gastric Acidity Protection' },
  { name: 'Cetirizine', defaultDose: '10 mg', purpose: 'Antihistamine / Allergy Relief' },
  { name: 'Aspirin', defaultDose: '75 mg', purpose: 'Antiplatelet / Blood Thinner' },
  { name: 'Insulin Glargine', defaultDose: '10 IU', purpose: 'Long-acting Glycemic Control' },
];

export function analyzeMedicalText(rawText: string): MedicalAnalysisResult {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Detect Patient Name
  let patientName = 'Patient';
  const nameMatch = rawText.match(/(?:patient\s*(?:name)?|mr\.|mrs\.|ms\.)[:\s]+([A-Za-z\s]+)(?:[\n,;]|age)/i);
  if (nameMatch && nameMatch[1]) {
    patientName = nameMatch[1].trim();
  }

  // 2. Detect Report Date
  let reportDate = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });
  const dateMatch = rawText.match(/(?:date|dated)[:\s]+([0-9]{1,4}[/-][0-9]{1,2}[/-][0-9]{1,4})/i);
  if (dateMatch) {
    reportDate = dateMatch[1];
  }

  // 3. Extract Lab Parameters
  const labParameters: LabParameter[] = [];

  for (const test of KNOWN_LAB_TESTS) {
    for (const line of lines) {
      if (test.regex.test(line)) {
        // Look for number following the test name
        const numMatch = line.match(/(?:[:=-]|\bis\b|\bof\b)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/dl|g\/dl|%|cells\/mcl|mmhg|lakh\/mcl|°c)?/i);
        if (numMatch && numMatch[1]) {
          const val = parseFloat(numMatch[1]);
          if (!isNaN(val) && val > 0) {
            let status: 'normal' | 'high' | 'low' | 'critical' = 'normal';
            if (val >= test.criticalHigh) status = 'critical';
            else if (val <= test.criticalLow) status = 'critical';
            else if (val > test.max) status = 'high';
            else if (val < test.min) status = 'low';

            // Avoid duplicate additions
            if (!labParameters.some((p) => p.name === test.name)) {
              labParameters.push({
                name: test.name,
                value: val,
                unit: test.unit,
                referenceRange: `${test.min} - ${test.max} ${test.unit}`,
                status,
                insight: test.insight,
              });
            }
          }
        }
      }
    }
  }

  // 4. Extract Prescribed Medications
  const medications: ExtractedMedication[] = [];
  for (const med of COMMON_MEDICATIONS) {
    const medRegex = new RegExp(`\\b${med.name}\\b`, 'i');
    if (medRegex.test(rawText)) {
      // Find dosage if present
      const doseRegex = new RegExp(`${med.name}[^\\n0-9]*([0-9]+\\s*(?:mg|g|mcg|ml|iu))`, 'i');
      const doseMatch = rawText.match(doseRegex);
      const dosage = doseMatch ? doseMatch[1].trim() : med.defaultDose;

      // Find timing or frequency
      let frequency = 'Once Daily';
      let instructions = 'After food with water';

      if (/(?:twice\s*daily|bid|bd|1-0-1)/i.test(rawText)) {
        frequency = 'Twice Daily (1-0-1)';
      } else if (/(?:thrice\s*daily|tid|1-1-1)/i.test(rawText)) {
        frequency = 'Thrice Daily (1-1-1)';
      } else if (/(?:before\s*food|empty\s*stomach|ac\b)/i.test(rawText)) {
        instructions = '30 mins before meals';
      }

      medications.push({
        name: med.name,
        dosage,
        frequency,
        instructions,
        purpose: med.purpose,
      });
    }
  }

  // 5. Determine Overall Status & Diagnosis Summary
  const hasCritical = labParameters.some((p) => p.status === 'critical');
  const hasAbnormal = labParameters.some((p) => p.status === 'high' || p.status === 'low');

  const overallStatus = hasCritical ? 'critical' : hasAbnormal ? 'attention' : 'normal';

  let diagnosisSummary = 'Vitals and lab parameters are within expected physiological range.';
  if (hasCritical) {
    const critList = labParameters.filter((p) => p.status === 'critical').map((p) => p.name).join(', ');
    diagnosisSummary = `Critical values detected in ${critList}. Immediate medical review advised.`;
  } else if (hasAbnormal) {
    const abnList = labParameters.filter((p) => p.status === 'high' || p.status === 'low').map((p) => `${p.name} (${p.status.toUpperCase()})`).join(', ');
    diagnosisSummary = `Borderline or elevated indicators detected: ${abnList}. Continue prescribed regimen and routine monitoring.`;
  }

  // 6. Doctor Advice / Recommendations
  const doctorAdvice: string[] = [
    'Maintain consistent hydration (2.0 - 2.5 L daily).',
    'Follow up with attending physician if resting vitals deviate significantly from baseline.',
  ];

  if (labParameters.some((p) => p.name.includes('Glucose') && p.status !== 'normal')) {
    doctorAdvice.push('Monitor post-meal blood sugar levels closely; moderate refined carbohydrates.');
  }
  if (labParameters.some((p) => p.name.includes('Hemoglobin') && p.status === 'low')) {
    doctorAdvice.push('Increase dietary iron (leafy greens, legumes) or consider prescribed hematinic supplementation.');
  }
  if (medications.length > 0) {
    doctorAdvice.push(`Adhere strictly to prescribed schedule for ${medications.map((m) => m.name).join(', ')}.`);
  }

  return {
    patientName,
    reportDate,
    reportType: labParameters.length > 0 ? 'Comprehensive Diagnostic Lab Report' : 'Prescription & Clinical Summary',
    overallStatus,
    diagnosisSummary,
    labParameters,
    medications,
    doctorAdvice,
    rawText,
  };
}

// Sample reports for one-click testing
export const SAMPLE_REPORTS = [
  {
    title: 'Complete Blood & Metabolic Panel (Lab Report)',
    text: `MEDNEST HEALTHCARE DIAGNOSTICS & HOSPITAL
Patient Name: Ramesh Kumar   Age: 58 Yrs / Male   Date: 15-Nov-2026
Referred By: Dr. S. Annamalai, MD (Gen Med)

COMPREHENSIVE CLINICAL LAB REPORT:
-----------------------------------------------------------
Fasting Blood Sugar (FBS)     : 148.5 mg/dL   (Normal: 70 - 100 mg/dL)  [HIGH]
HbA1c (Glycated Hemoglobin)   : 7.4 %         (Normal: 4.0 - 5.6 %)     [HIGH]
Hemoglobin (Hb)               : 11.2 g/dL     (Normal: 12.0 - 16.5 g/dL)[LOW]
Total WBC Count               : 7400 cells/mcL(Normal: 4000 - 11000)    [NORMAL]
Platelet Count                : 2.40 lakh/mcL (Normal: 1.5 - 4.5 lakh)  [NORMAL]
Serum Creatinine              : 1.05 mg/dL    (Normal: 0.6 - 1.2 mg/dL) [NORMAL]
Total Cholesterol             : 215 mg/dL     (Normal: < 200 mg/dL)     [HIGH]
Blood Pressure                : 138/86 mmHg   (Normal: 120/80 mmHg)     [ELEVATED]

CLINICAL IMPRESSION:
Sub-optimally controlled Type 2 Diabetes Mellitus with mild microcytic anemia and early dyslipidemia.

PRESCRIPTION & ADVICE:
1. Metformin 500mg - 1 tablet twice daily after meals (1-0-1)
2. Atorvastatin 10mg - 1 tablet at bedtime (0-0-1)
3. Diet: Low glycemic index diet, reduce salt intake, 30 min daily walking.
Next follow up after 4 weeks with FBS & PPBS.`,
  },
  {
    title: 'Post-Op Recovery & Smart Pillow Prescription',
    text: `MEDNEST CARE - CLINICAL DISCHARGE & PRESCRIPTION SUMMARY
Patient: Smt. Lakshmi Devi   Age: 64 Yrs   Date: 16-Nov-2026
Department: Geriatric Care & Sleep Medicine

DIAGNOSIS & OBSERVATIONS:
Post-febrile recovery with nocturnal restlessness. Advised MedNest Smart Pillow monitoring.

VITALS LOG:
Body Temperature : 37.8 °C (Mild fever)
Blood Pressure   : 124/82 mmHg
Fasting Glucose  : 96 mg/dL (Normal)

PRESCRIBED MEDICATIONS:
1. Paracetamol 650mg - 1 tab SOS (maximum 3 times daily) after food for fever.
2. Pantoprazole 40mg - 1 tab early morning on empty stomach for 5 days.
3. Cetirizine 10mg - 1 tab at bedtime if allergic symptoms persist.

RECOMMENDATIONS:
- Keep smart pillow heart rate & temperature monitoring active during night rest.
- Hydrate adequately (minimum 2 liters water daily).
- Re-consult if temperature exceeds 38.5 °C.`,
  },
];
