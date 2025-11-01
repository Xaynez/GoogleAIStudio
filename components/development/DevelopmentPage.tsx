import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode; summary?: string }> = ({ title, summary, children }) => (
    <div className="bg-surface-card/50 p-6 rounded-2xl border border-border-subtle backdrop-blur-sm animate-fade-in">
        <h2 className="text-2xl font-bold mb-3 heading-gradient">{title}</h2>
        {summary && <p className="text-text-secondary mb-4">{summary}</p>}
        <div>{children}</div>
    </div>
);

const APITable: React.FC<{
    headers: string[];
    rows: { cols: string[] }[];
}> = ({ headers, rows }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-text-primary uppercase bg-surface-elevated/50">
                <tr>
                    {headers.map(header => <th key={header} scope="col" className="px-4 py-3">{header}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, index) => (
                    <tr key={index} className="border-b border-border-subtle">
                        {row.cols.map((col, cIndex) => (
                            <td key={cIndex} className={`px-4 py-3 ${cIndex === 0 ? 'font-semibold text-text-primary' : ''}`}>
                                {col}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const DevelopmentPage: React.FC = () => {
    return (
        <section className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl heading-gradient">
                        Development Framework
                    </h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">
                        EVOLVE was engineered entirely within Google AI Studio as a Gemini 2.5 Pro-powered ecosystem, combining multimodal reasoning, Workspace automation, and enterprise-grade compliance. This page outlines the precise integrations, API stack, and governance framework built for the Google Hackathon 2025.
                    </p>
                </div>

                <div className="space-y-8">
                    <Section title="1. Core Development Environment" summary="EVOLVE is built on Gemini 2.5 Pro APIs, Chrome AI, and Google Workspace APIs for seamless cross-tool orchestration.">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Primary Stack</h3>
                        <ul className="list-disc list-inside space-y-1 text-text-secondary">
                            <li><strong>Environment:</strong> Google AI Studio (Production Mode)</li>
                            <li><strong>Model Architecture:</strong> Gemini 2.5 Pro (Reasoning and Multimodal APIs)</li>
                            <li><strong>Optional Upgrades:</strong> Gemini 2.5 Free | Gemini 2.5 Pro | Veo 3 (API Key Required)</li>
                            <li><strong>Infrastructure:</strong> Google Cloud Functions + Vertex AI for execution and scaling</li>
                            <li><strong>Frontend:</strong> Chrome AI UI Framework with Material Design 3</li>
                            <li><strong>Storage & Audit:</strong> Google Drive API + Cloud Logging</li>
                            <li><strong>Compliance Core:</strong> EVOLVE Governance & Compliance Hub</li>
                        </ul>
                    </Section>

                    <Section title="2. Gemini 2.5 Core API Suite" summary="EVOLVE uses Gemini 2.5’s multimodal API suite for creation, analysis, translation, and reasoning.">
                        <APITable
                            headers={["API Function", "Role in EVOLVE"]}
                            rows={[
                                { cols: ["Prompt API", "Drives all business-plan, post, and idea generation workflows."] },
                                { cols: ["Proofreader API", "Ensures professional output across Business Suite and AI Studio modules."] },
                                { cols: ["Summarizer API", "Used in Research Assistant and AI Note Taker."] },
                                { cols: ["Translator API", "Powers full-page dynamic language system across all UI."] },
                                { cols: ["Writer API", "Used in Pitch Deck Generator and Content Studio."] },
                                { cols: ["Rewriter API", "Used for marketing copy, compliance summaries, and posts."] },
                                { cols: ["Reasoning API", "Core engine behind financial projections and governance evaluation."] },
                            ]}
                        />
                    </Section>
                    
                    <Section title="3. Workspace & Productivity Integrations" summary="Every Workspace API is integrated for real-time productivity, enhanced by Gemini’s contextual AI.">
                        <APITable
                            headers={["API", "Functionality", "Implementation"]}
                            rows={[
                                { cols: ["Docs API", "Creates and structures documents.", "Generates investor reports and plans."] },
                                { cols: ["Sheets API", "Handles financial and analytical data.", "Feeds Financial Visualizer and charts."] },
                                { cols: ["Slides API", "Designs dynamic presentations.", "Used by Pitch Deck Generator."] },
                                { cols: ["Drive API", "Stores and retrieves files securely.", "Cloud storage and audit tracking."] },
                                { cols: ["Meet API", "Enables instant video meetings with AI transcription.", "Instant Meeting and AI Note Taker modules."] },
                                { cols: ["Chat API", "Embeds AI-moderated team communication.", "Real-time collaboration channels."] },
                                { cols: ["Calendar API", "Schedules and optimizes tasks.", "Contextual event sync via Gemini."] },
                                { cols: ["Cloud Functions API", "Executes serverless tasks securely.", "Backend logic and automation layer."] },
                            ]}
                        />
                    </Section>
                    
                    <Section title="4. Creative and Multimodal Layer" summary="EVOLVE integrates Google’s creative APIs to produce visuals, media, and branded content.">
                         <APITable
                            headers={["Component", "Description"]}
                            rows={[
                                { cols: ["Veo 3 API (Key Required)", "Generates high-fidelity AI videos. Optional upgrade in Studio toggle for premium users."] },
                                { cols: ["Imagen API", "Produces photorealistic images and mockups for profile visuals and marketing assets."] },
                                { cols: ["Gemini Image API", "Creates media thumbnails and UI icons, used in UI and Marketplace."] },
                                { cols: ["Audio Studio (Experimental)", "Handles speech-to-text and audio summarization, enhancing Note Taker and Meeting Summaries."] },
                            ]}
                        />
                         <h3 className="text-lg font-semibold text-text-primary mt-4 mb-2">Model Toggle Interface</h3>
                        <ul className="list-disc list-inside space-y-1 text-text-secondary">
                            <li><strong>Free:</strong> Basic text generation and translation.</li>
                            <li><strong>Pro:</strong> Full multimodal support with reasoning and visual analysis.</li>
                            <li><strong>Veo 3:</strong> Requires API key for video generation and prototyping.</li>
                        </ul>
                    </Section>
                    
                     <Section title="5. Data Visualization & Research Layer" summary="Powered by Google Data APIs for analysis and decision support.">
                        <APITable
                            headers={["API", "Function", "Implementation"]}
                            rows={[
                                { cols: ["Charts API", "Generates real-time charts and metrics.", "Powers Financial Visualizer and analytics."] },
                                { cols: ["Looker Studio API", "Creates compliance and performance dashboards.", "Embedded in Governance Hub."] },
                                { cols: ["Search API", "Retrieves trusted research data.", "Used in Research Assistant."] },
                            ]}
                        />
                    </Section>

                    <Section title="6. Governance & Compliance Hub" summary="The Governance Hub is EVOLVE’s core for responsible AI operation and auditing.">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Key Mechanisms</h3>
                        <ul className="list-disc list-inside space-y-1 text-text-secondary">
                           <li>Continuous API monitoring for performance and uptime.</li>
                           <li>Built-in GDPR, HIPAA, PIPEDA, ISO/IEC 27701 alignment.</li>
                           <li>Human oversight layer for AI recommendations.</li>
                           <li>Privacy consent and Terms acceptance required on onboarding.</li>
                           <li>Real-time audit logs and report export via Drive API.</li>
                        </ul>
                    </Section>

                     <Section title="7. Dynamic Language System" summary="EVOLVE’s multilingual interface runs on the Gemini 2.5 Translator API, not Google Translate. It interprets and renders entire pages in real time, maintaining formatting and semantic accuracy.">
                         <ul className="list-disc list-inside space-y-1 text-text-secondary">
                            <li>Fully dynamic language toggle applies globally.</li>
                            <li>One-click translation without reload.</li>
                            <li>Persistent user language memory stored securely.</li>
                        </ul>
                    </Section>

                    <Section title="8. Hackathon Development Summary" summary="Objective: Deliver a Google-native AI ecosystem showcasing Gemini 2.5 Pro and Workspace integration within 30 days.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">Deliverables Achieved</h3>
                                <ul className="list-disc list-inside space-y-1 text-text-secondary">
                                    <li>7 Gemini 2.5 APIs (Prompt, Proofreader, Summarizer, Translator, Writer, Rewriter, Reasoning).</li>
                                    <li>10 Workspace and Infrastructure APIs.</li>
                                    <li>4 Creative and Multimodal APIs (Imagen, Gemini Image, Veo 3, Audio Studio).</li>
                                    <li>1 Governance & Compliance Hub with live audit capabilities.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">UI Enhancements</h3>
                                <ul className="list-disc list-inside space-y-1 text-text-secondary">
                                    <li>Branded dark/light theme toggle.</li>
                                    <li>Model tier toggle for Gemini and Veo.</li>
                                    <li>Dynamic language localization system.</li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <Section title="9. Future Roadmap">
                        <ul className="list-disc list-inside space-y-1 text-text-secondary">
                           <li>Integration with Gemini 3.0 Ultra for cross-modality contextual reasoning.</li>
                           <li>Developer sandbox for third-party AI tool integration.</li>
                           <li>Automated compliance report generation in Sheets and Docs.</li>
                           <li>Expansion of Marketplace for verified enterprise AI apps.</li>
                        </ul>
                    </Section>
                     <div className="text-center mt-12 text-text-secondary">
                        <p>The Development page verifies EVOLVE as a Google-first, Gemini 2.5 Pro-powered ecosystem built entirely within AI Studio. It combines reasoning, creation, translation, governance, and multimodal video generation through an auditable, compliant, and user-controlled environment.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};