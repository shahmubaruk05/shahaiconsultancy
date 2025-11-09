export default function TermsPage() {
    return (
        <div className="container py-12 md:py-24 prose">
            <h1>Terms and Conditions</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Please read these terms and conditions carefully before using Our Service.</p>
            <h2>Acknowledgment</h2>
            <p>
                These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
            </p>
            <p>
                Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
            </p>
            <h2>User Accounts</h2>
            <p>
                When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.
            </p>
             <h2>Termination</h2>
            <p>
                We may terminate or suspend Your Account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
            </p>
        </div>
    );
}
