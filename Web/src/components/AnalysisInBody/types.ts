
export interface InBodyData {
  height: string | null;
  weight: string | null;
  age: number | null;
  gender: string | null;
  muscle_mass: string | null;
  "body_fat_percentage (pbf)"?: string | null;
  body_fat_percentage?: string | null;
  body_fat_mass: string | null;
  water: string | null;
  protein: string | null;
  minerals: string | null;
  bmi: string | null;
  bmr: string | null;
  visceral_fat?: string | null;
  waist_hip_ratio?: string | null;
  trunk_fat_mass?: string | null;
  trunk_lean_mass?: string | null;
  inbody_score?: string | null;
  lbm?: string | null;
  tdee?: string | null;
  calories?: string | null;
  target_protein?: string | null;
  target_carbs?: string | null;
  target_fats?: string | null;
  measured_at: string | null;
  created_at: string | null;
  image: string | null;
  inbody_image?: string;
}