import styles from "./page.module.css";
import TabNav from "./components/TabNav";
import SideNav from "./components/SideNav";

type Course = { code: string; name: string };
type CourseSection = { label: string; courses: Course[] };
type CourseEntry =
  | { dept: string; courses: Course[]; sections?: never }
  | { dept: string; courses?: never; sections: CourseSection[] };

const coursework: CourseEntry[] = [
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
      { code: "COMPSCI 181", name: "Machine Learning" },
      { code: "COMPSCI 124", name: "Algorithms and Data Structures" },
      { code: "COMPSCI 1261", name: "Privacy, Fairness & Validity" },
      { code: "COMPSCI 61", name: "Systems Programming" },
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
      { code: "Qubit by Qubit", name: "Introduction to Quantum Computing" },
    ],
  },
  {
    dept: "Social Sciences",
    courses: [
      { code: "SOCIOL 1136", name: "Work and Culture" },
      { code: "WOMGEN 1225", name: "Visions of Feminism in the 21st Century" },
      { code: "WOMGEN 1410", name: "The Politics of Personal Writing" },
      { code: "EXPOS 20", name: "Expository Writing: Gender & Mental Health" },
      { code: "GENED 1033", name: "Conflict Resolution in a Divided World" },
    ],
  },
  {
    dept: "Entrepreneurship",
    courses: [
      { code: "ENG-SCI 139", name: "Innovation in Science and Engineering" },
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

      <div className={styles.content}>

        {/* About */}
        <section id="about" className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>About</span>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.prose}>
            <p>
              I grew up in Romania competing in physics and mathematics olympiads.
              I was the first female participant in history to rank top three at
              the European Physics Olympiad. At Harvard I am studying CS, Statistics, and
              Economics, with a concurrent master&apos;s in Statistics.
            </p>
            <p>
              Most of my work now lives at the intersection of markets and AI. Right now I am
              researching what happens when AI agents start acting strategically: negotiating,
              colluding, learning to exploit the rules they operate under. More
              broadly, I am drawn to questions at the intersection of fairness and system design:
              differential privacy, algorithmic fairness, and what it means to build systems that benefit everyone.
            </p>
            <p>
              Recently, I cofounded Telos, a startup in physical automation forecasting,
              where I helped raise $500,000 and earned us a place in Y Combinator&apos;s
              Summer 2026 batch. Committing full-time would have meant taking a gap year,
              which isn&apos;t an option as an international student on a visa, so I decided
              to step down and finish my Harvard degree. I graduate in December 2026, so
              very soon I&apos;ll be launching and raising again.
            </p>
          </div>
        </section>

        {/* Awards */}
        <section id="awards" className={styles.section}>
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
        <section id="activities" className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Activities</span>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.researchList}>

            <div className={styles.researchItem}>
              <div className={styles.researchMeta}>
                <span className={styles.researchYear}>2026</span>
                <span className={styles.researchOrg}>Co-founder &amp; COO</span>
              </div>
              <div className={styles.researchBody}>
                <h3 className={styles.researchTitle}>Telos (YC S26)</h3>
                <p className={styles.researchDesc}>Co-founded a startup in physical automation forecasting. Led fundraising efforts contributing to $500,000 raised, and was accepted into Y Combinator&apos;s Summer 2026 batch as a founder. Chose to finish my Harvard degree, so I couldn&apos;t be part of it any more, but I was happy to contribute and learned a lot along the way.</p>
              </div>
            </div>

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
                <span className={styles.researchOrg}>Harvard Statistics Department</span>
              </div>
              <div className={styles.researchBody}>
                <h3 className={styles.researchTitle}>Committee on Equity, Diversity, Inclusion, and Belonging</h3>
                <p className={styles.researchDesc}>Representing undergraduate students on the department&apos;s community-building committee. Contributed to initiatives including Stat Nights, the undergraduate colloquium series, and a directed reading program. Advocated for regular undergraduate Town Halls and surveys to surface student feedback directly to faculty.</p>
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
        <section id="coursework" className={styles.section}>
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
                      {dept.courses!.map((c) => (
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
        <section id="skills" className={styles.section}>
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

        {/* Contact */}
        <section id="contact" className={styles.section}>
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
            <p className={styles.contactLine}>
              <a href="https://linkedin.com/in/cristiana-murgoci" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                LinkedIn
              </a>
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>Cristiana Murgoci · {new Date().getFullYear()}</p>
        </footer>

      </div>

      <SideNav />
    </main>
  );
}
