import LoginHero from '../../components/Login/LoginHero';
import LoginForm from '../../components/Login/LoginForm';
import styles from '../../components/Login/Login.module.css';

const Login = () => {
  return (
    <div className={styles['login-container']}>
      <div className={styles['left-panel']}>
        <LoginHero />
      </div>
      <div className={styles['right-panel']}>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;