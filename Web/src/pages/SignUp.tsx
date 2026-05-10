import SignUpHero from '../components/SignUp/SignUpHero';
import SignUpForm from '../components/SignUp/SignUpForm';
import styles from '../components/SignUp/SignUp.module.css';

const SignUp = () => {
  
  return (
    /* استخدمنا class الـ container اللي في ملفك */
   <div className={styles['login-container']}>
   <div className={styles['left-panel']}><SignUpHero /></div>
   <div className={styles['right-panel']}><SignUpForm /></div>
</div>
  );
};

export default SignUp;