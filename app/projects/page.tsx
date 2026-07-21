import type { Metadata } from 'next';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Course projects and technical work by Cristiana Murgoci: lecture notes on differential privacy, F1 lap time prediction, institutional distrust analysis, poker game theory, and more.',
};

export default function ProjectsPage() {
  return (
    <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.researchList}>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>Spring 2026</span>
                <span className={styles.researchOrg}>CS 1261</span>
              </div>
              <div className={styles.researchBody}>
                <h2 className={styles.researchTitle}>
                  <a href="/notes" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                    Differential Privacy, Algorithmic Fairness &amp; Cryptography ↗
                  </a>
                </h2>
                <p className={styles.researchDesc}>
                  A self-contained set of lecture notes I wrote for CS 1261, my favorite course at Harvard.
                  Covers differential privacy, fairness impossibility results, the statistical validity of ML claims,
                  and the limits of enforcing fairness at scale.
                </p>
                <div className={styles.tags}>
                  {['differential privacy', 'algorithmic fairness', 'cryptography'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>May 2026 – present</span>
                <span className={styles.researchOrg}>Neuromail</span>
              </div>
              <div className={styles.researchBody}>
                <h2 className={styles.researchTitle}>Neuromail <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '13px', fontStyle: 'italic' }}>(link coming soon)</span></h2>
                <p className={styles.researchDesc}>
                  An AI-powered inbox assistant that replaces the chaos of Gmail with a focused, one-at-a-time
                  workflow. Reads your inbox, classifies each message by urgency and importance using a GPT-4 API call,
                  drafts replies you can edit, and learns your priorities over time via a scikit-learn ranker.
                  Deployed on Railway.
                </p>
                <div className={styles.tags}>
                  {['Python', 'Flask', 'LLM API', 'scikit-learn', 'Gmail API'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>Fall 2025</span>
                <span className={styles.researchOrg}>CS 61</span>
              </div>
              <div className={styles.researchBody}>
                <h2 className={styles.researchTitle}>
                  <a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                    Systems Software ↗
                  </a>
                </h2>
                <ul className={styles.researchDesc} style={{ paddingLeft: '1.2em', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/main/pset1" target="_blank" rel="noopener noreferrer"><strong>Memory allocator</strong></a>: custom malloc/free in C++ with leak detection, corruption reporting, and 60+ test cases</li>
                  <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/main/pset2" target="_blank" rel="noopener noreferrer"><strong>Binary reverse engineering</strong></a>: defused a compiled bomb by reading x86-64 assembly with GDB, no source code</li>
                  <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset3-cow/pset3" target="_blank" rel="noopener noreferrer"><strong>OS kernel</strong></a>: built WeensyOS on x86-64: virtual memory, process isolation, fork, copy-on-write, interrupt handling</li>
                  <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset4-phase4-final/pset4" target="_blank" rel="noopener noreferrer"><strong>Buffered I/O layer</strong></a>: I/O abstraction supporting sequential, strided, and scatter-gather access patterns</li>
                  <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset5/pset5" target="_blank" rel="noopener noreferrer"><strong>Unix shell</strong></a>: built sh61 in C++ with process management, piping, redirection, and background execution</li>
                  <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset6/pset6" target="_blank" rel="noopener noreferrer"><strong>Transaction database</strong></a>: concurrent financial transaction system with file I/O and integrity verification</li>
                </ul>
                <div className={styles.tags}>
                  {['C++', 'x86-64 assembly', 'OS kernel', 'GDB', 'systems'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>Fall 2025</span>
                <span className={styles.researchOrg}>CS 1090A</span>
              </div>
              <div className={styles.researchBody}>
                <h2 className={styles.researchTitle}>
                  <a href="/CS109A_F1_Presentation.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                    Predicting Formula 1 Lap Times ↗
                  </a>
                </h2>
                <p className={styles.researchDesc}>
                  Built a pipeline to predict F1 driver lap times from pre-race indicators across 271,773 driver-race-lap observations.
                  Merged the Kaggle F1 database with external weather data and engineered features including qualifying pace,
                  constructor, circuit, and driver age. Compared linear regression, polynomial ridge regression with
                  cross-validated regularization, and random forest with early stopping.
                </p>
                <div className={styles.tags}>
                  {['Python', 'scikit-learn', 'random forest', 'ridge regression'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>Fall 2025</span>
                <span className={styles.researchOrg}>STAT 139</span>
              </div>
              <div className={styles.researchBody}>
                <h2 className={styles.researchTitle}>
                  <a href="/stat139_project.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                    Demographic Determinants of Institutional Distrust ↗
                  </a>
                </h2>
                <p className={styles.researchDesc}>
                  Using the 2023 FDIC National Survey of Unbanked and Underbanked Households (69,484 households), we investigated which demographic groups distrust financial institutions and why. EDA revealed stark racial disparities: Black, Hispanic, and AIAN households face unbanked rates 5–7x higher than White households. Logistic regression identified Black race and Midwest region as the strongest demographic predictors of distrust.
                </p>
                <div className={styles.tags}>
                  {['R', 'logistic regression', 'FDIC data', 'financial inclusion'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>Spring 2025</span>
                <span className={styles.researchOrg}>CS 37</span>
              </div>
              <div className={styles.researchBody}>
                <h2 className={styles.researchTitle}>
                  <a href="/CS37_sportsbook_project.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                    The Incentive Pitfalls of Sports Betting ↗
                  </a>
                </h2>
                <p className={styles.researchDesc}>
                  Modeled sportsbook pricing strategy as a game between naive and sophisticated bettors.
                  Naive bettors misperceive probabilities and are swayed by win/loss streaks; sophisticated bettors
                  know the true odds. Simulated three boost scenarios: no promotion, one-time initial boost, and
                  dynamic targeting of discouraged bettors. The simulations showed that dynamic targeting maximizes
                  sportsbook profit by exploiting behavioral biases. Implemented in Python with full agent-based simulation.
                </p>
                <div className={styles.tags}>
                  {['game theory', 'agent-based simulation', 'behavioral economics', 'Python'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>Fall 2023</span>
                <span className={styles.researchOrg}>CS 136</span>
              </div>
              <div className={styles.researchBody}>
                <h2 className={styles.researchTitle}>
                  <a href="/CS136_final_project.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                    Improving Poker Winnings with Game Theory ↗
                  </a>
                </h2>
                <p className={styles.researchDesc}>
                  Argues that pot odds alone are insufficient for optimal poker play and derives the Mixed Strategy Nash Equilibrium
                  for heads-up scenarios. Shows that a GTO player achieves strictly higher expected value than any pure strategy
                  by bluffing at the right frequency (1:2 bluff-to-value ratio at all-in), making the opponent indifferent
                  between calling and folding.
                </p>
                <div className={styles.tags}>
                  {['game theory', 'Nash equilibrium', 'GTO', 'poker'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        <footer className={styles.footer}>
          <p>Cristiana Murgoci · {new Date().getFullYear()}</p>
        </footer>
    </div>
  );
}
