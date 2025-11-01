import React from 'react';
import { Shield } from 'lucide-react';

export const GovernancePolicyPage: React.FC = () => {
    return (
        <div className="bg-surface-bg py-12">
            <main className="container mx-auto max-w-4xl p-4 md:p-6 space-y-8 font-sans">
                <div className="text-center">
                    <Shield className="h-12 w-12 text-brand-cyan mx-auto mb-2" />
                    <h1 className="text-3xl font-bold text-text-primary font-display heading-gradient">Governance & Compliance Hub</h1>
                    <p className="text-text-secondary mt-1">Effective Date: October 30, 2025</p>
                </div>

                <div className="animate-fade-in bg-surface-card/50 border border-border-subtle rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="prose prose-invert prose-slate mx-auto max-w-none text-text-secondary prose-h2:font-display prose-h2:text-2xl prose-h2:text-brand-cyan prose-h3:text-xl prose-h3:text-text-primary prose-h3:font-semibold prose-strong:text-text-primary prose-ul:list-disc prose-ul:ml-5 prose-ol:list-decimal prose-ol:ml-5">
                        <h2>Summary</h2>
                        <p>The Governance & Compliance Hub defines how EVOLVE ensures responsible AI operations, data integrity, and human oversight.</p>

                        <h3>1. Governance Model</h3>
                        <p>EVOLVE aligns with the EU AI Act, ISO/IEC 42001, and AI Ethics Guidelines from global bodies to ensure our AI systems are developed and deployed responsibly.</p>

                        <h3>2. Transparency & Accountability</h3>
                        <p>Every AI output and system action is logged and traceable. Users have access to summaries of AI decision-making processes to foster trust and understanding.</p>

                        <h3>3. Human Oversight</h3>
                        <p>Human-in-the-loop reviews are mandatory for all decision-critical operations, including high-value transactions and compliance-sensitive content generation, ensuring that AI serves as an aid, not a replacement for human judgment.</p>

                        <h3>4. Bias Mitigation</h3>
                        <p>We conduct continuous model audits to identify and mitigate potential biases. Our goal is to ensure fairness across demographics, languages, and regions in all AI-driven recommendations and analyses.</p>

                        <h3>5. Ethical Use</h3>
                        <p>The use of EVOLVE's AI tools for deception, manipulation, misinformation, or any unlawful purpose is strictly prohibited. We are committed to fostering an environment of ethical and constructive AI application.</p>

                        <h3>6. User Responsibility</h3>
                        <p>Users are responsible for the inputs they provide to AI models and the final use of any generated outputs. You must adhere to these governance standards during every interaction with the platform.</p>

                        <h3>7. Audit Access</h3>
                        <p>To maintain accountability, authorized regulators or third-party auditors may be granted access to system logs and AI model documentation to verify compliance with legal and ethical standards.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};
