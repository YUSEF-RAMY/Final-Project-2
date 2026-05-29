import React, { useState, useRef } from 'react';
import { updateTargets } from '../../../services/planService';
import styles from './EditTargetsModal.module.css';

interface InitialTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface EditTargetsModalProps {
  initialTargets: InitialTargets;
  onClose: () => void;
  onSuccess: () => void;
}

const STORAGE_WATER    = 'hfy_water_target';
const STORAGE_ACTIVITY = 'hfy_activity_target';

const EditTargetsModal: React.FC<EditTargetsModalProps> = ({
  initialTargets,
  onClose,
  onSuccess,
}) => {
  const [calories, setCalories] = useState(Math.round(initialTargets.calories));
  const [protein,  setProtein]  = useState(Math.round(initialTargets.protein));
  const [carbs,    setCarbs]    = useState(Math.round(initialTargets.carbs));
  const [fats,     setFats]     = useState(Math.round(initialTargets.fats));
  const [water,    setWater]    = useState(
    Number(localStorage.getItem(STORAGE_WATER)) || 2.5
  );
  const [activity, setActivity] = useState(
    Number(localStorage.getItem(STORAGE_ACTIVITY)) || 10000
  );
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Save nutritional targets to API.
      await updateTargets({ calories, protein, carbs, fats });
      // Save water & activity locally and notify other components.
      localStorage.setItem(STORAGE_WATER,    String(water));
      localStorage.setItem(STORAGE_ACTIVITY, String(activity));
      window.dispatchEvent(new Event('hfy:targets-updated'));
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to save targets.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleBackdrop}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <i className="fa-solid fa-sliders" />
            </div>
            <div>
              <h2 className={styles.title}>Edit Targets</h2>
              <p className={styles.subtitle}>Adjust your daily nutrition & activity goals</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSave}>
          {/* Section: Nutrition */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              <i className="fa-solid fa-fork-knife" /> Nutrition Targets
            </span>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="t-calories">Calories (kcal)</label>
                <input
                  id="t-calories"
                  type="number"
                  className={styles.input}
                  value={calories}
                  min={500}
                  max={6000}
                  onChange={(e) => setCalories(Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="t-protein">Protein (g)</label>
                <input
                  id="t-protein"
                  type="number"
                  className={styles.input}
                  value={protein}
                  min={0}
                  max={500}
                  onChange={(e) => setProtein(Number(e.target.value))}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="t-carbs">Carbs (g)</label>
                <input
                  id="t-carbs"
                  type="number"
                  className={styles.input}
                  value={carbs}
                  min={0}
                  max={800}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="t-fats">Fats (g)</label>
                <input
                  id="t-fats"
                  type="number"
                  className={styles.input}
                  value={fats}
                  min={0}
                  max={300}
                  onChange={(e) => setFats(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section: Lifestyle */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              <i className="fa-solid fa-person-running" /> Lifestyle Targets
            </span>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="t-water">Water (L)</label>
                <input
                  id="t-water"
                  type="number"
                  className={styles.input}
                  value={water}
                  min={0.5}
                  max={10}
                  step={0.1}
                  onChange={(e) => setWater(Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="t-activity">Steps / day</label>
                <input
                  id="t-activity"
                  type="number"
                  className={styles.input}
                  value={activity}
                  min={1000}
                  max={50000}
                  step={500}
                  onChange={(e) => setActivity(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className={styles.error}>
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? (
                <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
              ) : (
                <><i className="fa-solid fa-check" /> Save Targets</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTargetsModal;
