// Generates a personalised AI nutrition insight from the user's real data.
// Entirely client-side — no extra API call needed.

import type { UserProfile } from '../services/profileService';
import type { SevenDayAverages, InBodyRecord } from '../services/analyticsService';

export interface AIInsight {
  title: string;
  body: string;
  tags: string[];
  type: 'positive' | 'warning' | 'info';
}

function formatGoal(raw?: string): string {
  if (!raw || typeof raw !== 'string') return 'Weight Loss';
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateInsight(
  profile: UserProfile,
  averages: SevenDayAverages,
  history: InBodyRecord[]
): AIInsight {
  const bmi         = Number(profile?.latest_body_report?.bmi               ?? 0);
  const bodyFat     = Number(profile?.latest_body_report?.body_fat_percentage ?? 0);
  const goal        = profile?.physical_profile?.primary_objective ?? 'weight_loss';
  const goalLabel   = formatGoal(goal);

  const proteinTarget  = Number(profile?.nutritional_targets?.protein  ?? 100);
  const calorieTarget  = Number(profile?.nutritional_targets?.calories ?? 2000);

  // Compute trends from history (newest first assumed)
  const sorted = [...history].sort((a, b) =>
    new Date(b.measured_at ?? b.created_at ?? '').getTime() -
    new Date(a.measured_at ?? a.created_at ?? '').getTime()
  );
  const latest   = sorted[0];
  const oldest   = sorted[sorted.length - 1];
  const weightChange = latest && oldest && sorted.length > 1
    ? Number(latest.weight)      - Number(oldest.weight)      : 0;
  const muscleChange = latest && oldest && sorted.length > 1
    ? Number(latest.muscle_mass) - Number(oldest.muscle_mass) : 0;

  const proteinRatio  = proteinTarget  > 0 ? averages.protein  / proteinTarget  : 0;
  const calorieRatio  = calorieTarget  > 0 ? averages.calories / calorieTarget  : 0;
  const hasData       = averages.daysWithData >= 3;

  // ── Rule priority ────────────────────────────────────────────────────────────

  // 1. Not enough data yet
  if (!hasData) {
    return {
      title: 'Personalising Your Analysis',
      body: `Log at least 3 days of meals to receive a tailored AI analysis for your ${goalLabel} goal. The more consistently you track, the more accurate the insights become.`,
      tags: ['Getting Started'],
      type: 'info',
    };
  }

  // 2. Muscle gain positive signal
  if (muscleChange > 0.3 && bodyFat < 28) {
    return {
      title: 'Strong Muscle Synthesis Detected',
      body: `Your protein synthesis rate is peaking following your consistent training and nutrition. You've gained ${muscleChange.toFixed(1)} kg of lean muscle. We project you will reach your target body fat percentage of ${Math.max(12, Math.round(bodyFat - muscleChange * 2))}% in approximately ${Math.ceil(bodyFat / 2)} weeks.`,
      tags: ['Protein Synthesis', 'Macro Shift'],
      type: 'positive',
    };
  }

  // 3. Low protein warning
  if (proteinRatio < 0.75) {
    return {
      title: 'Protein Intake Below Target',
      body: `Your average protein of ${Math.round(averages.protein)}g/day is ${Math.round((1 - proteinRatio) * 100)}% below your target of ${Math.round(proteinTarget)}g. Increasing protein helps preserve muscle and supports your ${goalLabel} goal. Try adding chicken breast, eggs, or Greek yogurt to each meal.`,
      tags: ['Low Protein', 'Muscle Preservation'],
      type: 'warning',
    };
  }

  // 4. Caloric surplus warning
  if (calorieRatio > 1.12) {
    const excess = Math.round(averages.calories - calorieTarget);
    return {
      title: 'Caloric Surplus Detected',
      body: `You are averaging ${Math.round(averages.calories)} kcal/day — ${excess} kcal above your target. Over 7 days this creates a surplus of ~${(excess * 7 / 7700).toFixed(2)} kg of potential fat gain. Consider adjusting portion sizes to stay aligned with your ${goalLabel} goal.`,
      tags: ['Caloric Surplus', 'Portion Control'],
      type: 'warning',
    };
  }

  // 5. Caloric deficit too aggressive
  if (calorieRatio < 0.7 && goal.includes('loss')) {
    return {
      title: 'Caloric Deficit Too Aggressive',
      body: `Your average intake of ${Math.round(averages.calories)} kcal is well below your target. Extreme deficits can cause muscle loss and fatigue. Aim for a moderate 300–500 kcal deficit to preserve lean mass while losing fat.`,
      tags: ['Aggressive Deficit', 'Muscle Risk'],
      type: 'warning',
    };
  }

  // 6. Weight loss progress positive
  if (weightChange < -1 && goal.includes('loss')) {
    return {
      title: 'Weight Loss on Track',
      body: `You've lost ${Math.abs(weightChange).toFixed(1)} kg since your last assessment — excellent progress toward your ${goalLabel} goal. Keep your current calorie balance and prioritise protein to ensure the weight lost is fat, not muscle.`,
      tags: ['Weight Loss', 'On Track'],
      type: 'positive',
    };
  }

  // 7. BMI in healthy range + consistent macros
  if (bmi >= 18.5 && bmi < 25 && calorieRatio >= 0.85 && calorieRatio <= 1.12 && proteinRatio >= 0.8) {
    return {
      title: 'Nutrition on Target',
      body: `Excellent consistency! Your average of ${Math.round(averages.calories)} kcal and ${Math.round(averages.protein)}g protein aligns perfectly with your ${goalLabel} goals. Your BMI of ${bmi.toFixed(1)} is in the healthy range. Maintain this balance for sustained results.`,
      tags: ['On Track', 'Consistent', 'Healthy BMI'],
      type: 'positive',
    };
  }

  // 8. Default informational
  return {
    title: 'Nutrition Analysis',
    body: `Based on your ${goalLabel} goal, aim for ${Math.round(proteinTarget)}g protein and ${Math.round(calorieTarget)} kcal daily. You are averaging ${Math.round(averages.calories)} kcal and ${Math.round(averages.protein)}g protein. Continue logging meals to refine your personalised plan.`,
    tags: ['Personalised Plan'],
    type: 'info',
  };
}
