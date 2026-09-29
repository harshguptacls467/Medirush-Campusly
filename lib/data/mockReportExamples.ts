export const mockReportExamples: Record<string, string> = {
  fullMasterDemo: `========================================================================
             MEDIRUSH AI CLINICAL PATHOLOGY & DIAGNOSTIC LABS
                   FULL MASTER COMPREHENSIVE LAB REPORT
========================================================================
PATIENT NAME: Rajesh Sharma | AGE: 48 Yrs | GENDER: Male | REF BY: Dr. A.K. Verma
LAB REF NO: MR-89472910 | DATE: 22-Aug-2026 | STATUS: Verified Official Report

------------------------------------------------------------------------
SECTION 1: COMPLETE BLOOD COUNT (CBC) & IRON PANEL
------------------------------------------------------------------------
Test Parameter           Result      Unit         Reference Range   Status
Hemoglobin (Hb)          9.2         g/dL         12.0 - 15.5       LOW
RBC Count                3.4         x10^6/uL     4.0 - 5.2         LOW
WBC Count                11.8        x10^3/uL     4.5 - 11.0        HIGH
Platelet Count           210         x10^3/uL     150 - 450         NORMAL
Serum Ferritin           12          ng/mL        20 - 200          LOW
MCV                      72          fL           80 - 100          LOW

------------------------------------------------------------------------
SECTION 2: LIVER FUNCTION TEST (LFT) & ENZYMES
------------------------------------------------------------------------
Test Parameter           Result      Unit         Reference Range   Status
SGPT (ALT)               145         U/L          7 - 56            HIGH
SGOT (AST)               98          U/L          8 - 48            HIGH
Total Bilirubin          2.4         mg/dL        0.2 - 1.2         HIGH
Direct Bilirubin         0.9         mg/dL        0.0 - 0.3         HIGH
Alkaline Phosphatase     210         U/L          44 - 147          HIGH
Serum Albumin            4.1         g/dL         3.5 - 5.0         NORMAL

------------------------------------------------------------------------
SECTION 3: KIDNEY FUNCTION TEST (KFT) & RENAL METABOLIC
------------------------------------------------------------------------
Test Parameter           Result      Unit         Reference Range   Status
Serum Creatinine         2.4         mg/dL        0.7 - 1.3         HIGH
Blood Urea Nitrogen (BUN) 42         mg/dL        7 - 20            HIGH
Uric Acid                8.9         mg/dL        3.5 - 7.2         HIGH
eGFR                     34          mL/min       > 90              LOW

------------------------------------------------------------------------
SECTION 4: LIPID PROFILE & CARDIAC FAT PANEL
------------------------------------------------------------------------
Test Parameter           Result      Unit         Reference Range   Status
Total Cholesterol        265         mg/dL        < 200             HIGH
Triglycerides            240         mg/dL        < 150             HIGH
LDL (Bad Cholesterol)    175         mg/dL        < 100             HIGH
HDL (Good Cholesterol)   34          mg/dL        > 40              LOW

------------------------------------------------------------------------
SECTION 5: DIABETES HBA1C & GLYCOSYLATED HEMOGLOBIN
------------------------------------------------------------------------
Test Parameter           Result      Unit         Reference Range   Status
HbA1c (Glycated Hb)      8.4         %            < 5.7             HIGH
Fasting Blood Sugar      168         mg/dL        70 - 99           HIGH
Post Prandial Glucose    235         mg/dL        < 140             HIGH

------------------------------------------------------------------------
SECTION 6: THYROID PROFILE (T3, T4, TSH)
------------------------------------------------------------------------
Test Parameter           Result      Unit         Reference Range   Status
TSH (Thyroid Stimulating) 8.9        uIU/mL       0.35 - 4.94       HIGH
Total T3                 0.72        ng/mL        0.80 - 2.00       LOW
Total T4                 4.2         ug/dL        5.1 - 14.1        LOW
========================================================================`,

  cbcDemo: `========================================================================
             MEDIRUSH DIAGNOSTICS - COMPLETE BLOOD COUNT (CBC)
========================================================================
PATIENT: Anita Sen | AGE: 32 Yrs | GENDER: Female | DATE: 15-Sep-2026

Test Parameter           Result      Unit         Reference Range   Status
Hemoglobin (Hb)          8.8         g/dL         12.0 - 15.0       LOW (Moderate Anemia)
RBC Count                3.1         x10^6/uL     3.8 - 4.8         LOW
WBC Count                6.4         x10^3/uL     4.0 - 10.0        NORMAL
Platelet Count           195         x10^3/uL     150 - 450         NORMAL
Serum Ferritin           9           ng/mL        15 - 150          LOW (Iron Deficiency)
MCV                      68          fL           80 - 96           LOW (Microcytic)
========================================================================`,

  lipidDemo: `========================================================================
             MEDIRUSH CARDIAC CARE - LIPID & CHOLESTEROL PANEL
========================================================================
PATIENT: Vikram Mehra | AGE: 52 Yrs | GENDER: Male | DATE: 10-Sep-2026

Test Parameter           Result      Unit         Reference Range   Status
Total Cholesterol        280         mg/dL        < 200             HIGH
Triglycerides            295         mg/dL        < 150             HIGH
LDL (Bad Cholesterol)    188         mg/dL        < 100             HIGH (Elevated Risk)
HDL (Good Cholesterol)   32          mg/dL        > 40              LOW
VLDL Cholesterol         59          mg/dL        5 - 30            HIGH
========================================================================`,

  diabetesDemo: `========================================================================
             MEDIRUSH ENDOCRINOLOGY - DIABETES MONITORING PANEL
========================================================================
PATIENT: Sunita Gupta | AGE: 56 Yrs | GENDER: Female | DATE: 18-Sep-2026

Test Parameter           Result      Unit         Reference Range   Status
HbA1c (Glycated Hb)      9.1         %            < 5.7             HIGH (Uncontrolled)
Fasting Blood Sugar      184         mg/dL        70 - 100          HIGH
Post Prandial Glucose    265         mg/dL        < 140             HIGH
Estimated Avg Glucose    215         mg/dL        90 - 120          HIGH
========================================================================`
};
