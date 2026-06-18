"""
constraints.py — Clinical Constraints for Nutrition Recommendations

Contains:
  1. GOAL_DISEASE_MATRIX  — ok / warning / forbidden per combination
  2. CLINICAL_RULES       — protein/carb/fat ranges per disease
  3. GOAL_MULTIPLIERS     — calorie adjustment per goal
  4. WARNING_MESSAGES     — human-readable warnings
  5. FORBIDDEN_MESSAGES   — human-readable forbidden reasons
  6. apply_safety_layer() — clips model output to clinical bounds
"""

import numpy as np

# ─────────────────────────────────────────────────────────────
# 1. GOAL × DISEASE MATRIX
#    ok / warning / forbidden
# ─────────────────────────────────────────────────────────────
GOAL_DISEASE_MATRIX = {
    'healthy':            {'lose_fat': 'ok',       'maintain': 'ok',       'gain_muscle': 'ok'},
    'overweight':         {'lose_fat': 'ok',       'maintain': 'warning',  'gain_muscle': 'forbidden'},
    'obesity':            {'lose_fat': 'ok',       'maintain': 'forbidden','gain_muscle': 'forbidden'},
    'underweight':        {'lose_fat': 'forbidden','maintain': 'ok',       'gain_muscle': 'ok'},
    'diabetes_type2':     {'lose_fat': 'ok',       'maintain': 'ok',       'gain_muscle': 'warning'},
    'hypertension':       {'lose_fat': 'ok',       'maintain': 'ok',       'gain_muscle': 'ok'},
    'insulin_resistance': {'lose_fat': 'ok',       'maintain': 'ok',       'gain_muscle': 'ok'},
    'fatty_liver':        {'lose_fat': 'ok',       'maintain': 'warning',  'gain_muscle': 'forbidden'},
    'heart_disease':      {'lose_fat': 'ok',       'maintain': 'ok',       'gain_muscle': 'warning'},
    'hypothyroidism':     {'lose_fat': 'ok',       'maintain': 'ok',       'gain_muscle': 'ok'},
    'kidney_disease':     {'lose_fat': 'warning',  'maintain': 'ok',       'gain_muscle': 'forbidden'},
    'pcos':               {'lose_fat': 'ok',       'maintain': 'ok',       'gain_muscle': 'ok'},
}

# ─────────────────────────────────────────────────────────────
# 2. WARNING MESSAGES
# ─────────────────────────────────────────────────────────────
WARNING_MESSAGES = {
    ('overweight',     'maintain'): (
        "الحفاظ على الوزن مع السمنة البسيطة غير مستحسن طبياً. "
        "يُنصح بالتركيز على خسارة الدهون تدريجياً للتحسين الصحي."
    ),
    ('diabetes_type2', 'gain_muscle'): (
        "بناء العضلات مع داء السكري يتطلب مراقبة دقيقة لمستوى السكر في الدم. "
        "استشر طبيبك قبل البدء ببرنامج تضخيم العضلات."
    ),
    ('fatty_liver',    'maintain'): (
        "الحفاظ على الوزن مع الكبد الدهني يُعيق الشفاء. "
        "يُوصى بخسارة 5-10% من الوزن لتحسين وظائف الكبد."
    ),
    ('heart_disease',  'gain_muscle'): (
        "بناء العضلات مع أمراض القلب يزيد من الحِمل على القلب. "
        "يُنصح بالتشاور مع طبيب القلب وإبقاء التمارين خفيفة إلى متوسطة."
    ),
    ('kidney_disease', 'lose_fat'): (
        "خسارة الدهون مع أمراض الكلى تتطلب تقييد البروتين بعناية شديدة. "
        "يجب مراقبة الكرياتينين والبوتاسيوم بانتظام مع أخصائي تغذية كلوية."
    ),
}

# ─────────────────────────────────────────────────────────────
# 3. FORBIDDEN MESSAGES + SUGGESTED ALTERNATIVES
# ─────────────────────────────────────────────────────────────
FORBIDDEN_MESSAGES = {
    ('overweight',   'gain_muscle'): {
        'reason':    "بناء العضلات مع زيادة الوزن سيزيد الوزن الإجمالي ويُعقّد الحالة الصحية.",
        'suggested': 'lose_fat',
        'note':      "ابدأ بخسارة الدهون أولاً حتى تصل لنسبة دهون صحية، ثم انتقل لبناء العضلات.",
    },
    ('obesity',      'maintain'): {
        'reason':    "الحفاظ على الوزن في حالة السمنة يُديم المخاطر الصحية المرتبطة بها.",
        'suggested': 'lose_fat',
        'note':      "خسارة 5-10% من الوزن الحالي تُحسّن بشكل كبير جميع المؤشرات الصحية.",
    },
    ('obesity',      'gain_muscle'): {
        'reason':    "بناء العضلات مع السمنة يزيد الوزن الإجمالي ويرفع خطر أمراض القلب والمفاصل.",
        'suggested': 'lose_fat',
        'note':      "الأولوية الطبية هي خسارة الدهون أولاً. العضلات تُبنى لاحقاً.",
    },
    ('underweight',  'lose_fat'): {
        'reason':    "خسارة الدهون مع نقص الوزن ستؤدي إلى نقص حاد في الكتلة العضلية وسوء التغذية.",
        'suggested': 'gain_muscle',
        'note':      "الهدف الطبي الأول هو زيادة الوزن بشكل صحي من خلال بناء العضلات.",
    },
    ('fatty_liver',  'gain_muscle'): {
        'reason':    "بناء العضلات يتطلب فائضاً في السعرات قد يُفاقم الكبد الدهني.",
        'suggested': 'lose_fat',
        'note':      "خسارة الدهون تُحسّن الكبد الدهني بشكل مباشر وهي الأولوية الطبية.",
    },
    ('kidney_disease','gain_muscle'): {
        'reason':    "بناء العضلات يتطلب بروتيناً عالياً يُجهد الكلى المريضة ويرفع الكرياتينين.",
        'suggested': 'maintain',
        'note':      "الأولوية هي الحفاظ على وظائف الكلى مع نظام غذائي منخفض البروتين.",
    },
}

# ─────────────────────────────────────────────────────────────
# 4. CLINICAL MACRO RULES per DISEASE
#    prot_kg: (min, max) g per kg body weight
#    carb_pct: (min, max) % of total calories
#    fat_pct:  (min, max) % of total calories
# ─────────────────────────────────────────────────────────────
CLINICAL_RULES = {
    'healthy':            {'prot_kg': (0.8,  2.2), 'carb_pct': (0.40, 0.60), 'fat_pct': (0.20, 0.35)},
    'overweight':         {'prot_kg': (1.0,  1.5), 'carb_pct': (0.35, 0.50), 'fat_pct': (0.25, 0.35)},
    'obesity':            {'prot_kg': (1.0,  1.5), 'carb_pct': (0.30, 0.45), 'fat_pct': (0.25, 0.35)},
    'underweight':        {'prot_kg': (1.2,  2.0), 'carb_pct': (0.45, 0.60), 'fat_pct': (0.25, 0.35)},
    'diabetes_type2':     {'prot_kg': (0.8,  1.5), 'carb_pct': (0.30, 0.45), 'fat_pct': (0.25, 0.40)},
    'hypertension':       {'prot_kg': (0.8,  1.5), 'carb_pct': (0.40, 0.55), 'fat_pct': (0.20, 0.30)},
    'insulin_resistance': {'prot_kg': (1.0,  1.5), 'carb_pct': (0.30, 0.45), 'fat_pct': (0.25, 0.40)},
    'fatty_liver':        {'prot_kg': (1.0,  1.5), 'carb_pct': (0.35, 0.50), 'fat_pct': (0.20, 0.30)},
    'heart_disease':      {'prot_kg': (0.8,  1.2), 'carb_pct': (0.45, 0.60), 'fat_pct': (0.20, 0.30)},
    'hypothyroidism':     {'prot_kg': (1.0,  1.5), 'carb_pct': (0.35, 0.50), 'fat_pct': (0.25, 0.35)},
    'kidney_disease':     {'prot_kg': (0.6,  0.8), 'carb_pct': (0.55, 0.65), 'fat_pct': (0.25, 0.35)},
    'pcos':               {'prot_kg': (1.0,  1.8), 'carb_pct': (0.30, 0.45), 'fat_pct': (0.30, 0.40)},
}

# Protein boost for gain_muscle (multiplier on prot_kg range)
GAIN_MUSCLE_PROTEIN_BOOST = {
    'healthy':            1.4,   # up to 2.2 g/kg
    'underweight':        1.3,
    'diabetes_type2':     1.1,   # warning — slight boost only
    'hypertension':       1.2,
    'insulin_resistance': 1.2,
    'hypothyroidism':     1.2,
    'pcos':               1.2,
}

# ─────────────────────────────────────────────────────────────
# 5. GOAL CALORIE MULTIPLIERS
# ─────────────────────────────────────────────────────────────
GOAL_MULTIPLIERS = {
    'lose_fat':    0.775,
    'maintain':    1.0,
    'gain_muscle': 1.11,
}


# ─────────────────────────────────────────────────────────────
# 6. MAIN FUNCTIONS
# ─────────────────────────────────────────────────────────────

def check_goal_disease(goal: str, disease: str) -> dict:
    """
    Check if goal + disease combination is ok / warning / forbidden.

    Returns:
        {
          'status':    'ok' | 'warning' | 'forbidden',
          'message':   str,
          'suggested': str | None,   # only for forbidden
          'note':      str | None,   # only for forbidden
        }
    """
    disease_matrix = GOAL_DISEASE_MATRIX.get(disease, {})
    status = disease_matrix.get(goal, 'ok')

    if status == 'forbidden':
        info = FORBIDDEN_MESSAGES.get((disease, goal), {})
        return {
            'status':    'forbidden',
            'message':   info.get('reason',    'هذا الهدف غير مناسب طبياً لهذه الحالة.'),
            'suggested': info.get('suggested', 'maintain'),
            'note':      info.get('note',      ''),
        }

    if status == 'warning':
        msg = WARNING_MESSAGES.get((disease, goal), 'يُنصح بالتشاور مع طبيب قبل المتابعة.')
        return {
            'status':    'warning',
            'message':   msg,
            'suggested': None,
            'note':      None,
        }

    return {'status': 'ok', 'message': '', 'suggested': None, 'note': None}


def apply_safety_layer(
    calories: float,
    protein:  float,
    carbs:    float,
    fat:      float,
    weight:   float,
    disease:  str,
    goal:     str,
) -> dict:
    """
    Clip model output to clinical bounds.
    Returns corrected {calories, protein, carbs, fat} + was_clipped flag.
    """
    rules   = CLINICAL_RULES.get(disease, CLINICAL_RULES['healthy'])
    clipped = False

    # ── Protein bounds ──
    prot_min_g = rules['prot_kg'][0] * weight
    prot_max_g = rules['prot_kg'][1] * weight

    # Boost protein upper bound for gain_muscle
    if goal == 'gain_muscle':
        boost = GAIN_MUSCLE_PROTEIN_BOOST.get(disease, 1.0)
        prot_max_g = prot_max_g * boost

    if protein < prot_min_g or protein > prot_max_g:
        protein = float(np.clip(protein, prot_min_g, prot_max_g))
        clipped = True

    # ── Recalculate calories from macros ──
    prot_cal  = protein * 4
    fat_cal   = fat     * 9
    carb_cal  = carbs   * 4
    total_cal = prot_cal + carb_cal + fat_cal

    # ── Carb % bounds ──
    carb_pct = carb_cal / total_cal if total_cal > 0 else 0
    carb_min, carb_max = rules['carb_pct']

    if carb_pct < carb_min or carb_pct > carb_max:
        target_carb_pct = float(np.clip(carb_pct, carb_min, carb_max))
        remaining_cal   = total_cal - prot_cal
        carb_cal        = target_carb_pct * total_cal
        fat_cal         = max(0, remaining_cal - carb_cal)
        carbs   = carb_cal / 4
        fat     = fat_cal  / 9
        clipped = True

    # ── Fat % bounds ──
    fat_pct = fat_cal / total_cal if total_cal > 0 else 0
    fat_min, fat_max = rules['fat_pct']

    if fat_pct < fat_min or fat_pct > fat_max:
        target_fat_pct = float(np.clip(fat_pct, fat_min, fat_max))
        fat     = (target_fat_pct * total_cal) / 9
        clipped = True

    # ── Final rounding ──
    protein  = round(protein, 1)
    carbs    = round(carbs,   1)
    fat      = round(fat,     1)
    calories = int(round(prot_cal + carbs * 4 + fat * 9))

    return {
        'calories': calories,
        'protein':  protein,
        'carbs':    carbs,
        'fat':      fat,
        'clipped':  clipped,
    }
