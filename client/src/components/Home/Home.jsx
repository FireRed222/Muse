import { Link } from "react-router-dom";
import s from "./Home.module.css";
import CoolButton from "../Button/Button";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <>
      <motion.div
        className={s.noiseBg}
        animate={{ x: [0, 20, -20, 0], y: [0, 10, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.section
        className={s.home}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
      >
        <motion.div
          className={s.info}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <h1 className={s.ttl}>See Cloudy's Favourite Albums</h1>
          <Link to="/posts">
            <CoolButton text="Click Me" />
          </Link>
        </motion.div>
      </motion.section>
    </>
  );
};

export default Home;
