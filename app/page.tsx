'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import FadeUp from "./components/FadeUp";

const research = [
  {
    year: "2025 – present",
    title: "Market Making for AI Alignment",
    link: "/MM_for_AI_Alignment.pdf",
    org: "Senior Thesis · Harvard Statistics & CS",
    description:
      "Proposes training a market-maker model to forecast a human's reflective judgment after exposure to all relevant arguments, while adversaries surface information that most shifts that forecast. Developed during the AISES fellowship (Summer 2025). A simulation probe showed that prompting alone makes the market-maker worse — it over-corrects on weak counterarguments — establishing why training competitiveness is the core research question. The full proposal pairs MM with ELK-style probes, process supervision, and cross-examination, evaluated against RLHF and Debate baselines on truthfulness, calibration, and deception robustness.",
    tags: ["AI alignment", "mechanism design", "LLMs"],
  },
  {
    year: "2025 – present",
    title: "Emergent Collusion in LLM Market Agents",
    link: "/SPAR_collusion_midterm.pdf",
    org: "SPAR",
    description:
      "Designing and evaluating multi-agent simulations where LLM agents act in market environments, with Prof. Shi Feng (GWU) and Arush Tagade. Key finding: agents collude significantly more when they can communicate and recognize shared model weights. Building tools to measure and mitigate systemic risks from emergent agent coordination.",
    tags: ["multi-agent systems", "collusion", "market simulation"],
  },
  {
    year: "Jul – Aug 2025",
    title: "AI Safety Policy Fellowship",
    org: "Harvard AI Safety Team",
    description:
      "Selective fellowship on AI governance and safety. Covered technical foundations of machine learning, risks from advanced AI, compute governance, corporate responsibility, and international policy frameworks. Engaged with research, government reports, and regulatory proposals on frontier AI systems and safety standards.",
    tags: ["AI governance", "compute policy", "frontier AI"],
  },
  {
    year: "Jul – Aug 2024",
    title: "AI Safety Technical Fellowship",
    org: "Harvard AI Safety Team",
    description:
      "Analyzed reinforcement learning from human feedback (RLHF), goal misgeneralization, mechanistic interpretability, and red teaming for AI systems. Developed skills in AI model evaluation, deceptive behavior analysis, and safety regulations for industrial-scale AI, contributing to discussions on policy and alignment strategies.",
    tags: ["RLHF", "interpretability", "red teaming"],
  },
  {
    year: "January 2024",
    title: "Citadel Securities Quant Invitational",
    org: "Citadel Securities",
    description:
      "Designed and implemented an ETF arbitrage bot capitalizing on market inefficiencies. Developed a statistical arbitrage strategy trading pairs of correlated stocks within a six-asset portfolio, achieving a Sharpe ratio of 55.8 in a simulated random walk environment.",
    tags: ["quantitative finance", "statistical arbitrage", "algorithmic trading"],
  },
  {
    year: "August 2023",
    title: "Insight Program",
    org: "Jane Street",
    description:
      "Highly selective program introducing undergraduate students to market-making strategies including arbitrage, through trading simulation games.",
    tags: ["market-making", "arbitrage", "trading"],
  },
  {
    year: "March 2023",
    title: "First-Year Trading and Technology Program",
    org: "Jane Street",
    description:
      "Highly selective program introducing first-year undergraduates to Jane Street's trading and technology models. Participated in classes and team-based mock trading simulations.",
    tags: ["trading", "market structure", "technology"],
  },
  {
    year: "Summer 2023",
    title: "Quantum ML for Neutrino Detection",
    org: "Harvard SEAS REU",
    description:
      "Created a quantum data processing protocol for the IceCube neutrino experiment using quantum annealing, in the Carlos Argüelles Group. Wrote an optimization algorithm achieving exponential speedup over classical methods for neutrino event analysis. Work presented at Fermilab.",
    tags: ["quantum computing", "particle physics", "IceCube"],
  },
  {
    year: "August 2023",
    title: "US Quantum Information Science Summer School",
    org: "Fermilab",
    description:
      "Intensive summer school on quantum computing at Fermilab. Track: Qubits, Simulation, Quantum Software, Algorithms, and Applications. Studied combinatorial optimization, QAOA, quantum error correction, and QPUs. Implemented quantum algorithms in Qiskit and QuTiP.",
    tags: ["quantum computing", "Qiskit", "algorithms"],
  },
  {
    year: "2021 – 2022",
    title: "Research Assistant",
    org: "Alexandru Proca Centre for Scientific Research",
    description:
      "Research on applications of electromagnetic forces in medicine, in the Dr. Eng. Mircea Ignat Group. Investigated using flexible electrodes and magnetic fields to treat atherosclerosis, nanometric carbon particles for faster drug delivery, and magnetic field modulation of blood viscosity as a non-invasive alternative to aspirin.",
    tags: ["biomedical physics", "electromagnetics", "research"],
  },
  {
    year: "2020, 2021, 2022",
    title: "Physics Unlimited Explorer Research Competition",
    org: "Princeton Alumni Organization",
    description:
      "Led teams across three years in a research competition organized by Princeton alumni. Projects: path integral approach to quantum mechanics and Feynman diagrams (Honorable Mention, 2022), designing a quantum cascade laser (Honorable Mention, 2021), and modeling orbital resonance (Special Award, 2020).",
    tags: ["physics", "research", "competition"],
  },
];

const coursework = [
  {
    dept: "Mathematics & Statistics",
    courses: [
      { code: "Math 55A/B", name: "Studies in Algebra & Analysis" },
      { code: "STAT 210", name: "Graduate Probability" },
      { code: "STAT 220", name: "Bayesian Inference" },
      { code: "STAT 242", name: "Time Series" },
      { code: "STAT 139", name: "Linear Models" },
      { code: "STAT 288", name: "AI and Earth Observations for Sustainable Development" },
      { code: "STAT 110", name: "Introduction to Probability" },
      { code: "STAT 111", name: "Statistical Inference" },
    ],
  },
  {
    dept: "Computer Science",
    courses: [
      { code: "COMPSCI 1210", name: "Theoretical Computer Science" },
      { code: "COMPSCI 136", name: "Economics and Computation" },
      { code: "COMPSCI 37", name: "Incentives in the Wild" },
      { code: "COMPSCI 2881R", name: "AI Alignment and Safety" },
      { code: "COMPSCI 1261", name: "Privacy, Fairness & Validity" },
      { code: "COMPSCI 61", name: "Systems Programming" },
      { code: "ENG-SCI 139", name: "Innovation in Science and Engineering" },
    ],
  },
  {
    dept: "Economics",
    courses: [
      { code: "ECON 10A", name: "Principles of Economics: Microeconomics" },
      { code: "ECON 10B", name: "Principles of Economics: Macroeconomics" },
      { code: "ECON 1011A", name: "Intermediate Microeconomics: Advanced" },
      { code: "ECON 1021", name: "Using Markets to Solve Social Problems" },
    ],
  },
  {
    dept: "Physics",
    courses: [
      { code: "PHYSICS 143A", name: "Quantum Mechanics I" },
      { code: "PHYSICS 151", name: "Mechanics" },
    ],
  },
  {
    dept: "Social Sciences & Humanities",
    courses: [
      { code: "SOCIOL 1136", name: "Work and Culture" },
      { code: "WOMGEN 1225", name: "Visions of Feminism in the 21st Century" },
      { code: "WOMGEN 1410", name: "The Politics of Personal Writing" },
      { code: "EXPOS 20", name: "Expository Writing: Gender & Mental Health" },
      { code: "GENED 1033", name: "Conflict Resolution in a Divided World" },
    ],
  },
  {
    dept: "Pre-College",
    courses: [
      { code: "Qubit by Qubit", name: "Introduction to Quantum Computing" },
    ],
  },
];

const skills = {
  computational: ["Python", "C++", "R", "PyTorch", "TensorFlow", "SQL", "Inspect", "Pandas", "scikit-learn", "Next.js", "Flask", "Supabase", "Qiskit"],
  applied: [
    "LLM finetuning",
    "economic modeling",
    "mechanism design",
    "algorithmic game theory",
    "statistical inference",
    "multi-agent systems",
    "differential privacy",
    "algorithmic fairness",
    "market simulation",
    "risk assessment",
  ],
};

const awards = [
  { year: '2026',                         name: 'Intellectual Contribution Award',                                org: 'Harvard · Cabot House' },
  { year: '2024',                         name: 'Honor Medal for Outstanding Results in International Olympiads',  org: 'Institute of Atomic Physics' },
  { year: '2022',                         name: 'Silver Medal · Best Female Contestant',                          org: 'European Physics Olympiad' },
  { year: '2022',                         name: 'Finalist, Biomedical Engineering Category',                      org: 'Regeneron ISEF' },
  { year: '2022',                         name: 'Honor Medal for Outstanding Results in International Olympiads',  org: 'Institute of Atomic Physics' },
  { year: '2022',                         name: '"Florea Uliu" Award for Top Results in National Olympiads',      org: 'Romanian Physics Society' },
  { year: '2021',                         name: 'Gold Medal · Third Place · Best Female Contestant',              org: 'European Physics Olympiad' },
  { year: '2021',                         name: 'Gold Medal',                                                     org: 'Nordic-Baltic Physics Olympiad' },
  { year: '2021',                         name: 'Gold Medal',                                                     org: 'International Zhautykov Olympiad in Physics' },
  { year: '2021',                         name: 'Honorable Mention',                                              org: 'Asian Physics Olympiad' },
  { year: '2021',                         name: 'First Place',                                                    org: 'Romanian Science and Engineering Fair' },
  { year: '2017, 2018, 2019, 2021, 2022', name: 'Gold Medal · First Place (2021)',                               org: 'Romanian National Physics Olympiad' },
  { year: '2019',                         name: 'Gold Medal',                                                     org: 'Romanian National Mathematics Olympiad' },
  { year: '2017',                         name: 'Member of the Romanian National Team',                           org: 'Junior Balkan Mathematical Olympiad' },
];

type Tab = 'projects' | 'research' | 'background' | 'writing';

const TABS: { id: Tab; label: string }[] = [
  { id: 'background', label: 'Background'  },
  { id: 'projects',   label: 'Projects'    },
  { id: 'research',   label: 'Research'    },
  { id: 'writing',    label: 'Writing'     },
];

function SkillRow({ items }: { items: string[] }) {
  return (
    <div className={styles.skillList}>
      {items.map((s, i) => (
        <span key={s}>
          <span className={styles.skill}>{s}</span>
          {i < items.length - 1 && <span className={styles.skillDot} />}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('background');

  function handleTab(tab: Tab) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className={styles.main}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>Researcher · Builder · Harvard</p>
          <h1 className={styles.name}>Cristiana Murgoci</h1>
          <p className={styles.tagline}>
            Researcher at the intersection of AI safety, statistics, and physical automation.
          </p>
          <div className={styles.heroDivider} />
          <p className={styles.heroMeta}>
            Bachelor&apos;s in Statistics &amp; CS · Harvard College<br />
            Master&apos;s in Statistics · Harvard Graduate School of Arts and Sciences
          </p>
        </div>
        <div className={styles.heroPhotoFrame}>
          <div className={styles.heroPhoto}>
            <img src="/headshot.jpg" alt="Cristiana Murgoci" className={styles.headshot} />
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <nav className={styles.tabBar}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`${styles.tabButton} ${activeTab === id ? styles.tabActive : ''}`}
            onClick={() => handleTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>

        {/* ── About (always visible) ────────────────── */}
        <FadeUp>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>About</span>
              <div className={styles.sectionRule} />
            </div>
            <div className={styles.prose}>
              <p>
                I grew up in Romania competing in physics and mathematics olympiads.
                I was the first female participant in history to rank top three at
                the European Physics Olympiad. At Harvard I am studying CS, Statistics, and
                Economics, with a concurrent MA in Statistics.
              </p>
              <p>
                Most of my work now lives at the intersection of markets and AI. Right now I am
                researching what happens when AI agents start acting strategically: negotiating,
                colluding, learning to exploit the rules they operate under. More
                broadly, I am drawn to questions at the intersection of fairness and system design:
                differential privacy, algorithmic fairness, and what it means to build systems that benefit everyone.
              </p>
            </div>
          </section>
        </FadeUp>

        {/* ── Projects tab ──────────────────────────── */}
        {activeTab === 'projects' && (
          <section className={styles.section}>
            <div className={styles.researchList}>

              <div className={styles.researchItem}>
                <div className={styles.researchMeta}>
                  <span className={styles.researchYear}>Spring 2026</span>
                  <span className={styles.researchOrg}>CS 1261</span>
                </div>
                <div className={styles.researchBody}>
                  <h3 className={styles.researchTitle}>
                    <a href="/CS1261_Unofficial_Lecture_Notes_Murgoci.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                      Differential Privacy, Algorithmic Fairness &amp; Cryptography ↗
                    </a>
                  </h3>
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
                  <span className={styles.researchYear}>Mar 2026 – present</span>
                  <span className={styles.researchOrg}>thauma.app</span>
                </div>
                <div className={styles.researchBody}>
                  <h3 className={styles.researchTitle}>
                    <a href="https://thauma.app" target="_blank" rel="noopener noreferrer" style={{ borderBottom: '1px solid var(--border)', color: 'inherit' }}>Thauma ↗</a>
                  </h3>
                  <p className={styles.researchDesc}>
                    A platform for connecting researchers with collaborators and curious people with projects worth working on.
                    The name is the Greek word for wonder, the thing Aristotle said is the beginning of philosophy.
                    Thauma lets researchers post projects with detailed scopes, researchers and students apply with written responses,
                    and a dashboard tracks everything from first contact to accepted collaborator.
                    Built on Next.js and Supabase.
                  </p>
                  <div className={styles.tags}>
                    {['Next.js', 'Supabase', 'research infrastructure'].map(t => (
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
                  <h3 className={styles.researchTitle}>Neuromail</h3>
                  <p className={styles.researchDesc}>
                    An AI-powered inbox assistant that replaces the chaos of Gmail with a focused, one-at-a-time
                    workflow. Reads your inbox, classifies each message by urgency and importance using OpenAI,
                    drafts replies you can edit, and learns your priorities over time via a scikit-learn ranker.
                    Designed around a single constraint: it never sends anything without your explicit confirmation.
                    Deployed on Railway.
                  </p>
                  <div className={styles.tags}>
                    {['Python', 'Flask', 'OpenAI', 'scikit-learn', 'Gmail API'].map(t => (
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
                  <h3 className={styles.researchTitle}>
                    <a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                      Systems Software ↗
                    </a>
                  </h3>
                  <ul className={styles.researchDesc} style={{ paddingLeft: '1.2em', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/main/pset1" target="_blank" rel="noopener noreferrer"><strong>Memory allocator</strong></a> — custom malloc/free in C++ with leak detection, corruption reporting, and 60+ test cases</li>
                    <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/main/pset2" target="_blank" rel="noopener noreferrer"><strong>Binary reverse engineering</strong></a> — defused a compiled bomb by reading x86-64 assembly with GDB, no source code</li>
                    <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset3-cow/pset3" target="_blank" rel="noopener noreferrer"><strong>OS kernel</strong></a> — built WeensyOS on x86-64: virtual memory, process isolation, fork, copy-on-write, interrupt handling</li>
                    <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset4-phase4-final/pset4" target="_blank" rel="noopener noreferrer"><strong>Buffered I/O layer</strong></a> — I/O abstraction supporting sequential, strided, and scatter-gather access patterns</li>
                    <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset5/pset5" target="_blank" rel="noopener noreferrer"><strong>Unix shell</strong></a> — built sh61 in C++ with process management, piping, redirection, and background execution</li>
                    <li><a href="https://github.com/cs61/cs61-f25-psets-cristiana-murgoci/tree/pset6/pset6" target="_blank" rel="noopener noreferrer"><strong>Transaction database</strong></a> — concurrent financial transaction system with file I/O and integrity verification</li>
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
                  <h3 className={styles.researchTitle}>
                    <a href="/CS109A_F1_Presentation.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                      Predicting Formula 1 Lap Times ↗
                    </a>
                  </h3>
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
                  <h3 className={styles.researchTitle}>
                    <a href="/stat139_project.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                      Demographic Determinants of Institutional Distrust ↗
                    </a>
                  </h3>
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
                  <h3 className={styles.researchTitle}>
                    <a href="/CS37_sportsbook_project.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                      Strategic Promotions in Sports Betting Markets ↗
                    </a>
                  </h3>
                  <p className={styles.researchDesc}>
                    Modeled sportsbook pricing strategy as a game between naive and sophisticated bettors.
                    Naive bettors misperceive probabilities and are swayed by win/loss streaks; sophisticated bettors
                    know the true odds. Simulated three boost scenarios — no promotion, one-time initial boost, and
                    dynamic targeting of discouraged bettors — showing that dynamic targeting maximizes sportsbook
                    profit by exploiting behavioral biases. Implemented in Python with full agent-based simulation.
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
                  <h3 className={styles.researchTitle}>
                    <a href="/CS136_final_project.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                      Improving Poker Winnings with Game Theory ↗
                    </a>
                  </h3>
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
        )}

        {/* ── Research tab ──────────────────────────── */}
        {activeTab === 'research' && (
          <section className={styles.section}>
            <div className={styles.researchList}>
              {research.map((item, i) => (
                <div key={i} className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>{item.year}</span>
                    <span className={styles.researchOrg}>{item.org}</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}>
                          {item.title} ↗
                        </a>
                      ) : item.title}
                    </h3>
                    <p className={styles.researchDesc}>{item.description}</p>
                    <div className={styles.tags}>
                      {item.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Background tab ────────────────────────── */}
        {activeTab === 'background' && (
          <>
            {/* Awards */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Awards &amp; Honours</span>
                <div className={styles.sectionRule} />
              </div>
              <div className={styles.awardsList}>
                {awards.map((a, i) => (
                  <div key={i} className={styles.awardRow}>
                    <div className={styles.awardLeft}>
                      <span className={styles.awardName}>{a.name}</span>
                      <span className={styles.awardOrg}>· {a.org}</span>
                    </div>
                    <span className={styles.awardYear}>{a.year}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Activities */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Activities</span>
                <div className={styles.sectionRule} />
              </div>
              <div className={styles.researchList}>

                <div className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>Sep 2025 – present</span>
                    <span className={styles.researchOrg}>AGI Strategy Reading Group</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}><a href="https://haist.ai" target="_blank" rel="noopener noreferrer">Harvard AI Safety Student Team ↗</a></h3>
                    <p className={styles.researchDesc}>Engaging with technical and governance literature on long-range AGI strategy and transformative AI risk.</p>
                  </div>
                </div>

                <div className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>Sep 2025 – present</span>
                    <span className={styles.researchOrg}>Student Representative</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}>Harvard Statistics Department, Committee on Equity, Diversity, Inclusion, and Belonging</h3>
                    <p className={styles.researchDesc}>Working to make the Statistics community more equitable and inclusive.</p>
                  </div>
                </div>

                <div className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>Jun 2025 – Feb 2026</span>
                    <span className={styles.researchOrg}>Director of Programming</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}><a href="https://www.wecodeconference.com" target="_blank" rel="noopener noreferrer">Harvard WECode ↗</a></h3>
                    <p className={styles.researchDesc}>Leading programming for the world&apos;s largest student-run undergraduate tech conference, organized by undergraduate women at Harvard. Responsible for speaker curation, session design, and the intellectual direction of the conference.</p>
                  </div>
                </div>

                <div className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>Jan 2023 – May 2024</span>
                    <span className={styles.researchOrg}>President</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}><a href="https://www.scholarsoffinance.org" target="_blank" rel="noopener noreferrer">Scholars of Finance, Harvard Chapter ↗</a></h3>
                    <p className={styles.researchDesc}>Founded and scaled the Harvard chapter: recruited members, built a mentorship program pairing experienced students with newer ones, ran speaker sessions with industry leaders, and served as primary liaison to the national organization.</p>
                  </div>
                </div>

                <div className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>Jan 2023 – May 2024</span>
                    <span className={styles.researchOrg}>Academic Coordinator</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}><a href="https://harvardquantum.com" target="_blank" rel="noopener noreferrer">Harvard Quantum Computing Association ↗</a></h3>
                    <p className={styles.researchDesc}>Organized weekly talks with CEOs and researchers in quantum computing. Led a Qiskit reading group and developed peer-led study groups.</p>
                  </div>
                </div>

                <div className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>Jan – May 2023</span>
                    <span className={styles.researchOrg}>Academic Chair</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}>Woodbridge International Society</h3>
                    <p className={styles.researchDesc}>Academic leadership within Harvard&apos;s international student society, organizing intellectual programming and fostering cross-cultural exchange.</p>
                  </div>
                </div>

                <div className={styles.researchItem}>
                  <div className={styles.researchMeta}>
                    <span className={styles.researchYear}>2023 – 2024</span>
                    <span className={styles.researchOrg}>Member</span>
                  </div>
                  <div className={styles.researchBody}>
                    <h3 className={styles.researchTitle}>Harvard Financial Analysts Club</h3>
                    <h3 className={styles.researchTitle}>Women in Computer Science</h3>
                    <h3 className={styles.researchTitle}>Harvard Ventures</h3>
                    <h3 className={styles.researchTitle}>Prod Days Program</h3>
                  </div>
                </div>

              </div>
            </section>

            {/* Coursework */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Coursework</span>
                <div className={styles.sectionRule} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {Array.from({ length: Math.ceil(coursework.length / 2) }, (_, i) => (
                  <div key={i} className={styles.deptPair}>
                    {coursework.slice(i * 2, i * 2 + 2).map((dept) => (
                      <div key={dept.dept}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>{dept.dept}</p>
                        <div className={styles.coursesGrid}>
                          {dept.courses.map((c) => (
                            <div key={c.code + c.name} className={styles.courseRow}>
                              <span className={styles.courseCode}>{c.code}</span>
                              <span className={styles.courseName}>{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Skills</span>
                <div className={styles.sectionRule} />
              </div>
              <div className={styles.skillsGrid}>
                <div className={styles.skillGroup}>
                  <p className={styles.skillGroupLabel}>Computational</p>
                  <SkillRow items={skills.computational} />
                </div>
                <div className={styles.skillGroup}>
                  <p className={styles.skillGroupLabel}>Applied</p>
                  <SkillRow items={skills.applied} />
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Writing tab ───────────────────────────── */}
        {activeTab === 'writing' && (
          <section className={styles.section}>
            <div className={styles.prose} style={{ marginTop: '8px' }}>
              <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
                Essays and writing coming soon.
              </p>
            </div>
          </section>
        )}

        {/* ── Contact (always visible) ──────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Contact</span>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.contactBlock}>
            <p className={styles.contactNote}>
              Open to research collaborations, conversations about AI safety and
              automation timelines, and meeting people working on hard problems.
            </p>
            <p className={styles.contactLine}>
              <a href="mailto:cristiana_murgoci@college.harvard.edu" style={{ color: 'var(--accent)' }}>
                cristiana_murgoci@college.harvard.edu
              </a>
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
