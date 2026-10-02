export const metadata = { title: "Privacy & Terms" };
export default function TermsPage() {
  return (
    <section className="container section terms-content">
      <span className="eyebrow">Development preview</span>
      <h1>Privacy & Terms</h1>
      <p>
        This prototype is provided for evaluation. Products, specifications,
        analytics and project stories are illustrative. No purchase or
        contractual commitment is made through this site.
      </p>
      <h2>Your information</h2>
      <p>
        Without a Supabase connection, form submissions are validated locally
        and are not sent or retained. The preview member session uses session
        storage, and demo saved products and quotation requests use local
        storage on this device. You can remove these through the account page.
      </p>
      <p>
        When Supabase is connected, account, enquiry and quotation information
        is stored in the configured Supabase project. Member records are
        protected by database access policies. Do not submit sensitive
        information during prototype testing.
      </p>
      <h2>Member access</h2>
      <p>
        The preview member experience is not real authentication. Real member
        access uses Supabase Auth. External technical data must be protected by
        an authenticated backend and should not be embedded in public assets.
      </p>
      <h2>Before public launch</h2>
      <p>
        Replace this development notice with reviewed business terms and a
        privacy policy identifying the business, data handling practices,
        retention periods and a privacy contact. Confirm all published product
        and company information.
      </p>
    </section>
  );
}
