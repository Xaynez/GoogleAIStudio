import React from 'react';
import { Shield } from 'lucide-react';

export const TermsOfUsePage: React.FC = () => {
    return (
        <div className="bg-surface-bg py-12">
            <main className="container mx-auto max-w-4xl p-4 md:p-6 space-y-8 font-sans">
                <div className="text-center">
                    <Shield className="h-12 w-12 text-brand-cyan mx-auto mb-2" />
                    <h1 className="text-3xl font-bold text-text-primary font-display heading-gradient">Terms of Use</h1>
                    <p className="text-text-secondary mt-1">Effective Date: October 30, 2025</p>
                </div>

                <div className="animate-fade-in bg-surface-card/50 border border-border-subtle rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="prose prose-invert prose-slate mx-auto max-w-none text-text-secondary prose-h2:font-display prose-h2:text-2xl prose-h2:text-brand-cyan prose-h3:text-xl prose-h3:text-text-primary prose-h3:font-semibold prose-strong:text-text-primary prose-ul:list-disc prose-ul:ml-5 prose-ol:list-decimal prose-ol:ml-5">
                        <h2>Summary</h2>
                        <p>These Terms of Use govern all access to and use of EVOLVE, its applications, integrations, and APIs. By accessing EVOLVE, users agree to these terms and all applicable laws and regulations.</p>

                        <h3>1. Acceptance of Terms</h3>
                        <p>Continued use of the EVOLVE platform constitutes your full acceptance of these Terms of Use. To access and use EVOLVE services, you must read and digitally accept these Terms. If you do not agree to these terms, you are not permitted to use the platform.</p>

                        <h3>2. Eligibility</h3>
                        <p>EVOLVE is designed for verified professionals who are 18 years of age or older and possess an active Google Workspace account. By using the platform, you represent and warrant that you meet these eligibility requirements.</p>

                        <h3>3. Use of Platform</h3>
                        <p>You agree to utilize EVOLVE responsibly and ethically. Misuse of AI tools, including the generation of harmful or misleading content, unauthorized data handling, or any activity that violates our Governance Framework, is strictly prohibited.</p>

                        <h3>4. Data Security and Storage</h3>
                        <p>Any data you create, upload, or generate remains your property. However, its handling, storage, and processing are governed by the EVOLVE Privacy Policy and the overarching Governance Framework to ensure security and compliance.</p>

                        <h3>5. Intellectual Property</h3>
                        <p>All trademarks, logos, software, and content provided by EVOLVE are the exclusive property of NovaTech Innovations Inc. and its licensors. You may not use, reproduce, or distribute any platform content without our express written permission.</p>

                        <h3>6. Termination of Access</h3>
                        <p>EVOLVE reserves the right to suspend or terminate your account at any time for violations of these terms, applicable laws, or our governance policies. We may do so with or without notice, depending on the severity of the violation.</p>

                        <h3>7. Modifications to Terms</h3>
                        <p>EVOLVE may modify these Terms of Use at any time. We will provide notice of any significant changes. To continue using the platform after a modification, you will be required to read and accept the updated version of the terms.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};