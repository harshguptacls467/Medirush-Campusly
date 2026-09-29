// Advanced Rule-based Medical Lab & Radiology Report Parser Engine

export interface ParsedParam {
  name: string;
  val: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  meaning: string;
  category: string;
}

export interface ImportantTerm {
  term: string;
  meaning: string;
}

export interface DietPlan {
  dos: string[];
  donts: string[];
}

export interface SimplifiedReportResult {
  categoryName: string;
  summaryHeading: string;
  summary: string;
  parsedParameters: ParsedParam[];
  abnormalParameters: ParsedParam[];
  normalParameters: ParsedParam[];
  important_terms: ImportantTerm[];
  questions_for_doctor: string[];
  dietPlan: DietPlan;
  specialist: string;
  is_emergency: boolean;
}

const MEDICAL_DICTIONARY: Record<string, { term: string; meaning: string; category: string }> = {
  // Blood / CBC
  "hemoglobin": { term: "Hemoglobin (हीमोग्लोबिन)", meaning: "Carries oxygen from lungs to rest of the body in red blood cells.", category: "CBC" },
  "rbc count": { term: "RBC Count (लाल रक्त कोशिकाएं)", meaning: "Red blood cells that carry oxygen throughout your body.", category: "CBC" },
  "wbc count": { term: "WBC Count (श्वेत रक्त कोशिकाएं)", meaning: "White blood cells that fight infections and viruses in immunity.", category: "CBC" },
  "platelet count": { term: "Platelets (प्लेटलेट्स)", meaning: "Cells that help blood clot to stop bleeding from cuts or injuries.", category: "CBC" },
  "serum ferritin": { term: "Serum Ferritin (शरीर में आयरन का स्तर)", meaning: "Measures iron storage level inside tissues and blood cells.", category: "CBC" },
  "mcv": { term: "MCV (Mean Corpuscular Volume)", meaning: "Measures average size of your red blood cells.", category: "CBC" },

  // Liver Function (LFT)
  "sgpt": { term: "SGPT / ALT (लिवर एंजाइम)", meaning: "Enzyme found in liver cells; rises when liver cells are damaged or inflamed.", category: "LFT" },
  "sgot": { term: "SGOT / AST (लिवर एंजाइम)", meaning: "Enzyme present in liver and heart tissue; indicates cell stress.", category: "LFT" },
  "total bilirubin": { term: "Total Bilirubin (बिलीरुबिन / पीलिया स्तर)", meaning: "Yellow pigment produced during breakdown of RBCs. High levels cause Jaundice.", category: "LFT" },
  "direct bilirubin": { term: "Direct Bilirubin (प्रत्यक्ष बिलीरुबिन)", meaning: "Bilirubin processed by liver and ready for excretion in bile.", category: "LFT" },
  "alkaline phosphatase": { term: "Alkaline Phosphatase (ALP)", meaning: "Enzyme related to bile ducts in liver and bone growth.", category: "LFT" },
  "serum albumin": { term: "Serum Albumin (एल्ब्यूमिन प्रोटीन)", meaning: "Major protein produced by liver that keeps fluid inside blood vessels.", category: "LFT" },

  // Kidney Function (KFT)
  "serum creatinine": { term: "Serum Creatinine (क्रिएटिनिन / गुर्दे की कार्यक्षमता)", meaning: "Waste product filtered out by kidneys; high level indicates impaired kidney filtration.", category: "KFT" },
  "blood urea nitrogen": { term: "Blood Urea Nitrogen (BUN / यूरिया)", meaning: "Waste product from protein breakdown cleared by healthy kidneys.", category: "KFT" },
  "uric acid": { term: "Uric Acid (यूरिक एसिड)", meaning: "Waste acid from purine digestion; high levels deposit in joint crystals causing Gout.", category: "KFT" },
  "egfr": { term: "eGFR (गुर्दा फ़िल्टर दर)", meaning: "Estimated Glomerular Filtration Rate; overall efficiency score of kidney filtration.", category: "KFT" },

  // Lipid / Cholesterol
  "total cholesterol": { term: "Total Cholesterol (कुल कोलेस्ट्रॉल)", meaning: "Total amount of fatty lipids in your bloodstream.", category: "Lipid" },
  "triglycerides": { term: "Triglycerides (ट्राइग्लीसराइड्स)", meaning: "Type of fat in blood converted from unused calories; high levels risk arterial blockage.", category: "Lipid" },
  "ldl": { term: "LDL Cholesterol (बैड कोलेस्ट्रॉल)", meaning: "Low-Density Lipoprotein that builds up plaque in heart arteries.", category: "Lipid" },
  "hdl": { term: "HDL Cholesterol (गुड कोलेस्ट्रॉल)", meaning: "High-Density Lipoprotein that removes bad fat from blood back to liver.", category: "Lipid" },

  // Diabetes & Glucose
  "hba1c": { term: "HbA1c (3 महीने की औसत शुगर)", meaning: "Glycated Hemoglobin showing average blood glucose levels over the past 2-3 months.", category: "Diabetes" },
  "fasting blood sugar": { term: "Fasting Blood Sugar (खाली पेट शुगर)", meaning: "Glucose level measured after 8-10 hours overnight fast.", category: "Diabetes" },
  "post prandial glucose": { term: "Post-Prandial Sugar (खाने के बाद शुगर)", meaning: "Glucose level measured 2 hours after taking a full meal.", category: "Diabetes" },

  // Thyroid
  "tsh": { term: "TSH (थायरॉइड उत्तेजक हार्मोन)", meaning: "Hormone produced by pituitary gland to control thyroid activity. High TSH = Underactive Thyroid.", category: "Thyroid" },
  "total t3": { term: "T3 Hormone (Triiodothyronine)", meaning: "Active thyroid hormone regulating metabolic rate, energy, and body weight.", category: "Thyroid" },
  "total t4": { term: "T4 Hormone (Thyroxine)", meaning: "Primary hormone secreted by thyroid gland.", category: "Thyroid" },

  // Emergency / Cardiac
  "troponin": { term: "Troponin I (हृदय की मांसपेशी एंजाइम)", meaning: "Cardiac enzyme released into blood during heart muscle injury or Heart Attack.", category: "Cardiac" },
  "ecg": { term: "ECG Finding (ईसीजी दिल की धड़कन)", meaning: "Electrical graph recording heart rhythm and muscle blood flow.", category: "Cardiac" }
};

export const simplifyReport = (rawText: string): SimplifiedReportResult => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      categoryName: "General",
      summaryHeading: "No Data",
      summary: "Invalid or empty report text. Please paste a valid medical report or upload an image.",
      important_terms: [],
      parsedParameters: [],
      abnormalParameters: [],
      normalParameters: [],
      questions_for_doctor: [],
      dietPlan: { dos: [], donts: [] },
      specialist: "General Physician",
      is_emergency: false
    };
  }

  const lines = rawText.split('\n');
  const lowerText = rawText.toLowerCase();

  const parsedParameters: ParsedParam[] = [];
  const important_terms: ImportantTerm[] = [];
  let is_emergency = false;

  // Emergency Check
  const emergencyKeywords = [
    'acute myocardial infarction', 'heart attack', 'st elevation', 'troponin', 
    'stroke', 'kidney failure', 'critical', 'emergency', 'cardiac arrest', 'internal bleeding'
  ];

  for (const kw of emergencyKeywords) {
    if (lowerText.includes(kw)) {
      is_emergency = true;
      break;
    }
  }

  // Parse key parameters line by line
  lines.forEach(line => {
    const lineLower = line.toLowerCase();
    
    Object.keys(MEDICAL_DICTIONARY).forEach(key => {
      if (lineLower.includes(key)) {
        let status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' = "NORMAL";
        if (lineLower.includes("high") || lineLower.includes("elevated") || lineLower.includes("increased")) {
          status = "HIGH";
        } else if (lineLower.includes("low") || lineLower.includes("decreased") || lineLower.includes("deficient")) {
          status = "LOW";
        } else if (lineLower.includes("critical") || lineLower.includes("severe")) {
          status = "CRITICAL";
        }

        // Match numeric value if present
        const valMatch = line.match(/(\d+\.?\d*)/);
        const observedVal = valMatch ? valMatch[1] : "Detected";

        const dictItem = MEDICAL_DICTIONARY[key];

        // Avoid duplicates
        if (!parsedParameters.some(p => p.name.toLowerCase().includes(key))) {
          parsedParameters.push({
            name: dictItem.term,
            val: observedVal,
            status: status,
            meaning: dictItem.meaning,
            category: dictItem.category
          });

          important_terms.push({
            term: dictItem.term,
            meaning: dictItem.meaning
          });
        }
      }
    });
  });

  // Determine report category & summary
  let categoryName = "General Health Test";
  let summaryHeading = "Comprehensive Medical Report Analysis";
  let detailedSummary = "Your medical report has been processed by MediRush AI. Below is the simplified breakdown of abnormal and healthy values:";
  let specialist = "General Physician (सामान्य चिकित्सक)";
  const dietPlan: DietPlan = {
    dos: ["Drink 2-3 Liters of clean water daily", "Eat fresh green leafy vegetables and fiber-rich foods", "Maintain 7-8 hours of sleep"],
    donts: ["Avoid excessive salty, deep-fried, or processed foods", "Do not skip meals or take unprescribed drugs", "Avoid smoking and alcohol"]
  };
  const questions_for_doctor: string[] = [
    "What do these high/low levels indicate about my condition?",
    "Do I need any follow-up blood tests or medication changes?",
    "What lifestyle or dietary modifications should I follow?"
  ];

  if (lowerText.includes('hemoglobin') || lowerText.includes('cbc') || lowerText.includes('anemia') || lowerText.includes('ferritin')) {
    categoryName = "Complete Blood Count (CBC) & Iron Profile";
    specialist = "Hematologist / General Physician (रक्त रोग विशेषज्ञ)";
    detailedSummary = "यह एक ब्लड काउंट टेस्ट रिपोर्ट है। इसमें हीमोग्लोबिन, आरबीसी, या आयरन के स्तर में बदलाव देखा गया है जो Anemia (एनीमिया/खून की कमी) या माइल्ड इंफेक्शन की ओर इशारा करता है।";
    dietPlan.dos = ["आयरन से भरपूर खाद्य पदार्थ खाएं: पालक, चुकंदर, अनार, खजूर, और सेब", "विटामिन सी वाले फल खाएं (संतरा, आंवला) जिससे आयरन अवशोषण बढ़े", "हरी पत्तेदार सब्जियां और दालें खाएं"];
    dietPlan.donts = ["खाने के तुरंत बाद चाय या कॉफी पीने से बचें (यह आयरन एब्जॉर्प्शन रोकता है)", "जंक फूड और कैफीन का सेवन सीमित करें"];
    questions_for_doctor.push("Should I take Iron or Folic Acid supplements?", "Is my anemia due to iron deficiency or nutritional diet?");
  } 
  else if (lowerText.includes('sgpt') || lowerText.includes('lft') || lowerText.includes('bilirubin') || lowerText.includes('liver')) {
    categoryName = "Liver Function Test (LFT) / लिवर प्रोफाइल";
    specialist = "Gastroenterologist / Hepatologist (पेट एवं लिवर रोग विशेषज्ञ)";
    detailedSummary = "यह लिवर फंक्शन रिपोर्ट है। आपके लिवर एंजाइम्स (SGPT/SGOT) या बिलीरुबिन (पीलिया) का स्तर बढ़ा हुआ है, जो लिवर सूजन (Fatty Liver या Jaundice) का संकेत दे सकता है।";
    dietPlan.dos = ["सादा सुपाच्य खाना (दलिया, खिचड़ी, उबली सब्जियां) खाएं", "भरपूर गुनगुना पानी और नारियल पानी पिएं", "लौकी का जूस और पपीता खाएं"];
    dietPlan.donts = ["तली-भुनी, मसालेदार, और बटर/चीज वाली चीजों से सख्त परहेज करें", "शराब (Alcohol) और जंक फूड का सेवन बिल्कुल न करें"];
    questions_for_doctor.push("Is this indicative of Fatty Liver or Jaundice?", "Do I need a Liver Ultrasound (USG) test?");
  }
  else if (lowerText.includes('creatinine') || lowerText.includes('kft') || lowerText.includes('uric acid') || lowerText.includes('urea') || lowerText.includes('egfr')) {
    categoryName = "Kidney Function Test (KFT) / गुर्दा स्वास्थ्य";
    specialist = "Nephrologist / Urologist (गुर्दा एवं मूत्र रोग विशेषज्ञ)";
    detailedSummary = "यह किडनी फंक्शन रिपोर्ट है। इसमें क्रिएटिनिन या यूरिक एसिड बढ़ा हुआ है, जो गुर्दों द्वारा रक्त की सफाई में सुस्ती या यूरिक एसिड जमाव (Gout) दर्शा सकता है।";
    dietPlan.dos = ["डॉक्टर की सलाह अनुसार सही मात्रा में पानी पिएं", "कम नमक (Low Sodium) और ताजे फल खाएं", "नींबू पानी और जौ का पानी पिएं"];
    dietPlan.donts = ["अत्यधिक प्रोटीन (रेड मीट, ज्यादा दालें) और पालक से परहेज करें", "बिना डॉक्टर की सलाह के दर्द निवारक दवाएं (Painkillers) न लें"];
    questions_for_doctor.push("What is my current Kidney eGFR filtration score?", "How can I lower my Serum Creatinine naturally?");
  }
  else if (lowerText.includes('cholesterol') || lowerText.includes('triglycerides') || lowerText.includes('lipid') || lowerText.includes('ldl')) {
    categoryName = "Lipid Profile / कोलेस्ट्रॉल एवं हृदय स्वास्थ्य";
    specialist = "Cardiologist / Physician (हृदय रोग विशेषज्ञ)";
    detailedSummary = "यह लिपिड प्रोफाइल (कोलेस्ट्रॉल) रिपोर्ट है। इसमें ट्राइग्लीसराइड्स या बैड कोलेस्ट्रॉल (LDL) बढ़ा हुआ है, जिससे नसों में रुकावट (Atherosclerosis) और हृदय रोग का जोखिम बढ़ता है।";
    dietPlan.dos = ["ओट्स, दलिया, लहसुन, अखरोट और ओमेगा-3 समृद्ध बीज (अलसी/चिया सीड्स) खाएं", "रोजाना 30 मिनट तेज पैदल चलें (Morning Walk)"];
    dietPlan.donts = ["घी, मक्खन, तली हुई चीजें, रिफाइंड तेल और फास्ट फूड बंद करें", "धूम्रपान और गतिहीन जीवनशैली से बचें"];
    questions_for_doctor.push("Do I need Statin medication to lower my cholesterol?", "What is my 10-year Cardiovascular Heart Risk?");
  }
  else if (lowerText.includes('hba1c') || lowerText.includes('glucose') || lowerText.includes('fasting') || lowerText.includes('diabetes')) {
    categoryName = "Diabetes & Glucose Profile / मधुमेह जांच";
    specialist = "Endocrinologist / Diabetologist (डायबिटीज विशेषज्ञ)";
    detailedSummary = "यह डायबिटीज (शुगर) टेस्ट रिपोर्ट है। आपका 3 महीने का औसत शुगर (HbA1c) या खाली पेट ग्लूकोज बढ़ा हुआ है, जो अनियंत्रित डायबिटीज (Type 2 Diabetes) का संकेत है।";
    dietPlan.dos = ["करेला, मेथी दाना, जामुन, हरी पत्तेदार सब्जियां और चने का आटा खाएं", "भोजन के बाद 15 मिनट टहलें"];
    dietPlan.donts = ["चीनी, मिठाई, कोल्ड ड्रिंक्स, सफेद चावल, मैदा, और आलू से बचें", "मीठे फल (केला, आम, चीकू) सीमित मात्रा में ही लें"];
    questions_for_doctor.push("What should be my target HbA1c level?", "Do I need to adjust my insulin/tablet dosage?");
  }
  else if (lowerText.includes('tsh') || lowerText.includes('thyroid') || lowerText.includes('t3') || lowerText.includes('t4')) {
    categoryName = "Thyroid Function Test / थायराइड जांच";
    specialist = "Endocrinologist (थायराइड विशेषज्ञ)";
    detailedSummary = "यह थायराइड ग्रंथि की जांच रिपोर्ट है। आपका TSH बढ़ा हुआ है, जो हाइपोथायरायडिज्म (Underactive Thyroid) की ओर इशारा करता है जिसमें सुस्ती व वजन बढ़ता है।";
    dietPlan.dos = ["आयोडीन युक्त नमक, नारियल पानी, ब्राजील नट्स और हरी सब्जियां लें", "सुबह खाली पेट नियमित व्यायाम करें"];
    dietPlan.donts = ["कच्चा पत्तागोभी, फूलगोभी, और सोयाबीन अत्यधिक मात्रा में न खाएं", "थायराइड की दवा सुबह खाली पेट पानी के साथ ही लें"];
    questions_for_doctor.push("Do I need Thyroxine (Thyronorm/Eltroxin) daily tablet?", "When should I re-check my TSH levels?");
  }
  else if (is_emergency) {
    categoryName = "Emergency Cardiac / Acute Medical Finding";
    specialist = "Emergency Cardiologist / Hospital ER (आपातकालीन हृदय विशेषज्ञ)";
    detailedSummary = "🚨 अति-आपातकालीन चेतावनी: इस रिपोर्ट में गंभीर मेडिकल स्थितियां (जैसे ECG में ST Elevation या हाई Troponin) पाई गई हैं जो दिल का दौरा (Heart Attack) या गंभीर स्थिति का संकेत हो सकती हैं।";
    questions_for_doctor.push("Is immediate hospital admission or angiography required?");
  }

  // Filter high/low flags
  const abnormalParameters = parsedParameters.filter(p => p.status === 'HIGH' || p.status === 'LOW' || p.status === 'CRITICAL');
  const normalParameters = parsedParameters.filter(p => p.status === 'NORMAL');

  return {
    categoryName,
    summaryHeading,
    summary: detailedSummary,
    parsedParameters,
    abnormalParameters,
    normalParameters,
    important_terms,
    questions_for_doctor,
    dietPlan,
    specialist,
    is_emergency
  };
};
