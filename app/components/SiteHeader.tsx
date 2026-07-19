import styles from '../page.module.css';
import TabNav from './TabNav';

export default function SiteHeader() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>Researcher · Builder · Harvard</p>
          <h1 className={styles.name}>Cristiana Murgoci</h1>
          <p className={styles.tagline}>
            Researcher at the intersection of AI safety, statistics, and physical automation.
          </p>
          <p className={styles.heroMeta}>
            Bachelor&apos;s in Statistics &amp; CS · Harvard College<br />
            Master&apos;s in Statistics · Harvard GSAS
          </p>
        </div>
        <div className={styles.heroPhotoFrame}>
          <div className={styles.heroPhoto}>
            <img src="/headshot.jpg" alt="Cristiana Murgoci" className={styles.headshot} />
          </div>
        </div>
      </section>

      <TabNav />
    </>
  );
}
