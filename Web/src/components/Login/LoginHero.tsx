import styles from './Login.module.css';

const LoginHero = () => {
  return (
    <div className={styles['left-side']}>
      <div className={styles['logo-tag']}>Healthyfy</div>
      <div className={styles['left-content']}>
        <div className={styles['hero-text']}>
          <h1>Unlock Your Best Self with AI-Powered Nutrition</h1>
          <p>
            Your digital nutritionist, curating insights and vitality tailored uniquely to you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginHero;