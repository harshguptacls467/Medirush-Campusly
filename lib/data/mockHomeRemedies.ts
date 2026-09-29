export interface HomeRemedy {
  id: number;
  problem: string;
  category: string;
  keywords: string[];
  description: string;
  symptoms: string[];
  remedies: string[];
  yoga_tips?: string[];
  when_to_see_doctor: string;
  warning?: string;
  icon: string;
}

export const mockHomeRemedies: HomeRemedy[] = [
  {
    id: 1,
    problem: "Cough, Cold & Sore Throat (खांसी और गले की खराश)",
    category: "Cold & Cough",
    keywords: ["khasi", "cough", "sore throat", "gala kharab", "gale me dard", "phlegm", "balgam", "dry cough", "sukhi khasi", "zukam", "cold", "kaadaha", "kadha", "cheston", "ascoril", "benadryl", "khasi ki dawai", "khasi me kya kare"],
    description: "Natural remedies for dry/wet cough, chest congestion, and throat scratchiness.",
    symptoms: [
      "Continuous coughing (dry or with mucus)",
      "Scratchy, painful sore throat while swallowing",
      "Nasal congestion & mild head heaviness",
      "Chest tightness & vocal cord irritation"
    ],
    remedies: [
      "Honey & Ginger Kadha: Take 1 tbsp fresh ginger juice mixed with 1 tbsp raw honey and a pinch of black pepper 2-3 times daily.",
      "Salt Water Gargle: Dissolve 1/2 tsp rock salt in warm water. Gargle for 30 seconds 3 times daily to reduce throat inflammation.",
      "Eucalyptus Steam Inhalation: Inhale steam from hot water infused with 2 drops eucalyptus oil or Vicks for 10 minutes.",
      "Turmeric Milk (Haldi Doodh): Drink 1 cup warm milk mixed with 1/2 tsp turmeric powder at bedtime for immune recovery."
    ],
    yoga_tips: [
      "Matsyasana (Fish Pose) helps open up chest airways.",
      "Anulom Vilom Pranayama (Alternate Nostril Breathing) clears nasal blockages."
    ],
    when_to_see_doctor: "If cough lasts beyond 10 days, produces blood-stained mucus, or causes high fever and breathing difficulty.",
    warning: "Do not give raw honey to infants under 1 year of age.",
    icon: "Wind"
  },
  {
    id: 2,
    problem: "Acidity, Heartburn & Gas (एसिडिटी और पेट की जलन)",
    category: "Acidity",
    keywords: ["acidity", "gas", "gerd", "pet me gas", "pet me jalan", "heartburn", "sour stomach", "bloat", "bloating", "indigestion", "pudin hara", "eno", "pet phoolna", "pantoprazole", "aciloc", "acid"],
    description: "Soothing natural digestive treatments for acid reflux, stomach bloating, and gas.",
    symptoms: [
      "Burning pain in upper chest or food pipe after meals",
      "Sour, acidic liquid belching or throat burn",
      "Abdominal heaviness and excessive gas trapping",
      "Nausea or appetite loss after heavy food"
    ],
    remedies: [
      "Ajwain & Hing Water: Boil 1/2 tsp Ajwain (Carom seeds) and a pinch of Asafoetida (Hing) in 1 glass water; drink warm after meals.",
      "Cold Milk or Buttermilk: Drink 1 glass of cold low-fat milk or fresh mint buttermilk (Chaas) with roasted cumin powder.",
      "Fennel Seed (Saunf) Infusion: Chew 1 tsp Saunf after lunch and dinner to stimulate digestive enzymes.",
      "Jaggery (Gud) Nibble: Eat a small piece of natural jaggery post-meal to neutralize excess stomach gastric acids."
    ],
    yoga_tips: [
      "Vajrasana (Diamond Pose) for 10 minutes right after meals aids fast digestion.",
      "Pawanmuktasana (Wind-Relieving Pose) releases trapped stomach gas."
    ],
    when_to_see_doctor: "If heartburn occurs daily, causes severe radiating chest pain, or is accompanied by difficulty swallowing.",
    warning: "Severe chest pain mimicking acidity can sometimes be a cardiac symptom; seek immediate medical care if severe.",
    icon: "Flame"
  },
  {
    id: 3,
    problem: "Tension Headache & Migraine (सर दर्द और माइग्रेन)",
    category: "Headache",
    keywords: ["headache", "sardard", "sar me dard", "head pain", "migraine", "tension headache", "stress", "sar ghumna", "sar dukhna", "headache remedy", "dolo", "disprin", "head ache"],
    description: "Proven herbal and physical therapies to relieve throbbing headaches, stress, and eye strain.",
    symptoms: [
      "Dull, squeezing pain around temples and forehead",
      "Throbbing one-sided pain sensitive to light/sound (Migraine)",
      "Neck and shoulder muscular stiffness"
    ],
    remedies: [
      "Peppermint & Ginger Tea: Drink fresh ginger tea with 2 crushed mint leaves to reduce neuro-inflammation.",
      "Cold/Warm Compress: Apply an ice pack on forehead for throbbing migraine, or a warm towel on neck for tension headache.",
      "Acupressure (LI-4 Point): Firmly massage the webbing between your thumb and index finger for 2 minutes.",
      "Stay Hydrated: Drink 2 large glasses of cool electrolyte water immediately, as dehydration causes 40% of sudden headaches."
    ],
    yoga_tips: [
      "Balasana (Child's Pose) relieves neck compression and calms the nervous system.",
      "Bhramari Pranayama (Humming Bee Breath) soothes cerebral tension."
    ],
    when_to_see_doctor: "If headache is sudden and explosive (thunderclap), accompanied by numbness, slurred speech, or high fever.",
    warning: "Consult a neurologist before taking unverified OTC painkillers repeatedly.",
    icon: "Zap"
  },
  {
    id: 4,
    problem: "Mild Fever & Body Aches (हल्का बुखार और बदन दर्द)",
    category: "Fever & Pain",
    keywords: ["fever", "bukhar", "badan dard", "body ache", "mild fever", "temperature", "chills", "halka bukhar", "dolo 650", "paracetamol"],
    description: "Gentle recovery therapies for low-grade seasonal viral fever and muscle fatigue.",
    symptoms: [
      "Oral temperature between 99°F - 101°F",
      "General body lethargy and joint soreness",
      "Mild chills and sweating cycles"
    ],
    remedies: [
      "Tulsi & Giloy Brew: Boil 8 Tulsi leaves and 1/2 inch Giloy stem in 2 cups water until reduced to half. Drink warm.",
      "Cold Sponge Bath: Dab forehead, neck, and armpits with room-temperature water cloth to gently bring down body temperature.",
      "Coconut Water & Hydration: Drink tender coconut water and clear vegetable broth to replenish lost electrolytes.",
      "Coriander Seed (Dhania) Decoction: Boil 1 tbsp crushed coriander seeds in water; helps accelerate sweat release and fever cooling."
    ],
    yoga_tips: [
      "Rest in Shavasana (Corpse Pose) with deep diaphragmatic breathing for immune cellular repair."
    ],
    when_to_see_doctor: "If body temperature exceeds 102°F, persists for more than 3 days, or causes persistent vomiting/rash.",
    warning: "Never use ice or ice-cold water for sponging as it causes rapid shivering and core temperature spike.",
    icon: "Thermometer"
  },
  {
    id: 5,
    problem: "Indigestion, Diarrhea & Loose Motions (दस्त और बदहजमी)",
    category: "Digestive",
    keywords: ["diarrhea", "loose motion", "dast", "pet kharab", "indigestion", "vomiting", "stomach bug", "ors", "electral", "food poisoning"],
    description: "Gut-calming solutions for stomach upset, loose stools, and dehydration prevention.",
    symptoms: [
      "Frequent watery stools and abdominal cramping",
      "Loss of electrolytes and dry mouth",
      "Rumbling gut sounds and nausea"
    ],
    remedies: [
      "WHO-Style ORS Drink: Mix 6 tsp sugar + 1/2 tsp salt in 1 liter clean boiled-cooled water. Sip constantly.",
      "Curd & Banana (BRAT Diet): Eat 1 bowl fresh unflavored probiotic curd mixed with 1 mashed ripe banana and roasted cumin.",
      "Pomegranate Juice (Anar): Fresh pomegranate juice has astringent properties that help firm up loose stools.",
      "Fenugreek (Methi) Seeds: Swallow 1/2 tsp methi seeds with 1 tbsp curd without chewing."
    ],
    yoga_tips: [
      "Gentle Supta Baddhakonasana (Reclining Bound Angle) with bolster support to relax abdominal cramping."
    ],
    when_to_see_doctor: "If stools contain blood or black tar, patient is unable to keep fluids down, or fever accompanies diarrhea.",
    warning: "Do not stop diarrhea completely with anti-motility drugs if caused by bacterial food poisoning without doctor consult.",
    icon: "Activity"
  },
  {
    id: 6,
    problem: "Insomnia & Sleep Disturbance (अनिद्रा और नींद की समस्या)",
    category: "Mental Wellness",
    keywords: ["insomnia", "sleep", "neend na aana", "restless", "stress", "anxiety", "deep sleep", "sleep remedies", "ashwagandha"],
    description: "Herbal sleep aids and circadian rhythm resets for peaceful restorative sleep.",
    symptoms: [
      "Difficulty falling asleep within 30 minutes of lying down",
      "Frequent nighttime awakenings and racing thoughts",
      "Morning fatigue and lack of mental focus"
    ],
    remedies: [
      "Nutmeg & Warm Milk: Drink 1 cup warm milk with a pinch of freshly grated Nutmeg (Jaiphal) and 2 saffron strands 30 mins before bed.",
      "Chamomile Tea: Brew 1 cup pure chamomile or Ashwagandha tea to stimulate GABA relaxation pathways.",
      "Warm Foot Soak & Mustard Oil Massage: Soak feet in warm salt water for 10 mins, then gently massage soles with warm mustard oil.",
      "Strict Screen Detox: Turn off all blue-light smartphones and LED screens 60 minutes before bedtime."
    ],
    yoga_tips: [
      "Viparita Karani (Legs-Up-The-Wall Pose) for 10 minutes before bed drains lymphatic pressure and drops heart rate.",
      "Nadi Shodhana Pranayama (Channel Clearing) to trigger parasympathetic calm."
    ],
    when_to_see_doctor: "If chronic sleeplessness lasts over 4 weeks and interferes with daily driving or memory function.",
    warning: "Do not take over-the-counter sedative pills without medical prescription.",
    icon: "Moon"
  }
];
