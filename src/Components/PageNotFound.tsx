import { Link } from "react-router-dom";
import styles  from "../Styling/PageNotFound.module.css"

const PageNotFound = () => {
  return (
    <div className={styles.notFoundContainer}>
      <h1 className={styles.notFoundTitle}>404</h1>
      <p className={styles.notFoundSubtitle}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <p className={styles.notFoundDescription}>
        It might have been removed, renamed, or deleted.
      </p>
      <Link to="/" className={styles.notFoundButton}>
        Go Back Home
      </Link>
    </div>
  );
};

export default PageNotFound;
