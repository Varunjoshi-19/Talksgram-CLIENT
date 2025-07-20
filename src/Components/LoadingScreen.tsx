import React from "react";
import  styles from "../Styling/LoadingScreen.module.css";

const LoadingScreen: React.FC = () => {



  return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingScreen;
