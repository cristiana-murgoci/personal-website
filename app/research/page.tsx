import type { Metadata } from 'next';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Research by Cristiana Murgoci on AI alignment, multi-agent collusion, vision-language models for library cataloging, quantum ML, and trading strategy. AISES research on market-making for AI alignment.',
};

const research = [
  {
    year: "2026",
    title: "AI Visual Discovery",
    org: "Harvard Library",
    description:
      "Building and open-sourcing vision-language pipelines that generate catalog metadata for special-collections photographs, working closely with librarians to automate the description and digitization of Houghton Library's collections at scale, and evaluating the pipelines against expert records so the methods stay accurate, reproducible, and open. Part of \"Beyond the Frame,\" a Harvard Library Advancing Open Knowledge grant.",
    tags: ["vision-language models", "AI cataloging", "model evaluation"],
  },
  {
    year: "2025 – present",
    title: "Market Making for AI Alignment",
    link: "/MM_for_AI_Alignment.pdf",
    org: "AISES Research",
    description:
      "Proposes training a market-maker model to forecast a human's reflective judgment after exposure to all relevant arguments, while adversaries surface information that most shifts that forecast. Developed during the AISES fellowship (Summer 2025). A simulation probe showed that prompting alone makes the market-maker worse because it over-corrects on weak counterarguments, establishing why training competitiveness is the core research question. The full proposal pairs MM with ELK-style probes, process supervision, and cross-examination, evaluated against RLHF and Debate baselines on truthfulness, calibration, and deception robustness.",
    tags: ["AI alignment", "mechanism design", "LLMs"],
  },
  {
    year: "2025 – present",
    title: "Characterizing Collusive Dynamics in Multi-Agent LLM Systems",
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

export default function ResearchPage() {
  return (
    <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.researchList}>
            {research.map((item, i) => (
              <div key={i} className={styles.researchItem}>
                <div className={styles.researchMeta}>
                  <span className={styles.researchYear}>{item.year}</span>
                  <span className={styles.researchOrg}>{item.org}</span>
                </div>
                <div className={styles.researchBody}>
                  <h2 className={styles.researchTitle}>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', borderBottom: '1px solid var(--border)' }}
                      >
                        {item.title} ↗
                      </a>
                    ) : (
                      item.title
                    )}
                  </h2>
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

        <footer className={styles.footer}>
          <p>Cristiana Murgoci · {new Date().getFullYear()}</p>
        </footer>
    </div>
  );
}
