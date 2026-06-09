import type { Metadata } from 'next';
import styles from '../page.module.css';
import TabNav from '../components/TabNav';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Essays and writing by Cristiana Murgoci.',
};

export default function WritingPage() {
  return (
    <main className={styles.main}>
      <TabNav />
      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.prose} style={{ marginTop: '8px' }}>
            <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
              Essays and writing coming soon.
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>Cristiana Murgoci · {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
}
