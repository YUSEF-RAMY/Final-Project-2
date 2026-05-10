// تأكد من وجود كلمة export في البداية
export interface InBodyData {
  height: string | null;
  weight: string | null;
  age: number | null;
  gender: string | null;
  muscle_mass: string | null;
  "body_fat_percentage (pbf)": string | null;
  body_fat_mass: string | null;
  water: string | null;
  protein: string | null;
  minerals: string | null;
  bmi: string | null;
  bmr: string | null;
  measured_at: string | null;
  created_at: string | null;
  image: string | null;
  inbody_image?: string;
}