import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="bg-surface-bg py-12">
            <main className="container mx-auto max-w-4xl p-4 md:p-6 space-y-8 font-sans">
                <div className="text-center">
                    <Shield className="h-12 w-12 text-brand-cyan mx-auto mb-2" />
                    <h1 className="text-3xl font-bold text-text-primary font-display heading-gradient">Privacy Policy</h1>
                    <p className="text-text-secondary mt-1">Effective Date: October 30, 2025</p>
                </div>

                <div className="animate-fade-in bg-surface-card/50 border border-border-subtle rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="prose prose-invert prose-slate mx-auto max-w-none text-text-secondary prose-h2:font-display prose-h2:text-2xl prose-h2:text-brand-cyan prose-h3:text-xl prose-h3:text-text-primary prose-h3:font-semibold prose-strong:text-text-primary prose-ul:list-disc prose-ul:ml-5 prose-ol:list-decimal prose-ol:ml-5">
                        <h2>Summary</h2>
                        <p>EVOLVE is committed to protecting user privacy through responsible AI design, transparent data practices, and compliance with global data protection laws (GDPR, PIPEDA, HIPAA, and ISO/IEC 27701).</p>

                        <h3>1. Information Collection</h3>
                        <p>EVOLVE collects only essential user data required for platform functionality and security. This includes account credentials, document metadata for analysis, and anonymized usage statistics for platform optimization. We do not collect personal data beyond what is necessary for identity verification and service delivery.</p>

                        <h3>2. Data Use</h3>
                        <p>Your data is processed solely for the purposes of service delivery, AI model improvement, and compliance auditing. We use data to personalize your experience, provide AI-driven insights, and ensure the security of our platform. We do not use your data for advertising purposes.</p>

                        <h3>3. Storage and Retention</h3>
                        <p>All user data is encrypted both in transit and at rest, stored securely in Google Cloud environments. Data is retained only for as long as necessary to fulfill the purposes for which it was collected or to comply with legal and regulatory obligations.</p>

                        <h3>4. Data Sharing</h3>
                        <p>EVOLVE never sells your data. Limited and secure data sharing occurs only with Google APIs as a fundamental part of authorized platform integrations you choose to activate. All third-party data processing is governed by strict data protection agreements.</p>

                        <h3>5. User Rights</h3>
                        <p>You have the right to access, correct, or delete your personal data. Data export and deletion requests can be submitted through the Governance Hub. We will process your request in accordance with applicable data protection laws.</p>

                        <h3>6. Cookies and Tracking</h3>
                        <p>EVOLVE uses essential cookies strictly for managing session authentication and remembering your acceptance of our policies. We do not use cookies for tracking or advertising purposes.</p>

                        <h3>7. Security Practices</h3>
                        <p>We employ a multi-layered security approach, including continuous monitoring, end-to-end encryption, and periodic third-party security audits to ensure the integrity and confidentiality of your data.</p>
                        
                        <h3>8. Changes to This Policy</h3>
                        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy and updating the effective date. Significant changes will require you to re-accept the policy before continuing to use our services.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};