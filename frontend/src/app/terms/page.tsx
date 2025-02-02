export default function Terms() {
  return (
    <div className="flex w-full flex-col ">
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-0 md:py-8">
        <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
          Terms of Use
        </h1>
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Service Description
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              ForumAI is an application that combines AI capabilities with
              structured academic forums, enabling students and faculty to
              collaborate in a controlled environment where AI assists learning
              while maintaining academic integrity.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Your Account
            </h2>
            <ul className="mt-2 list-disc pl-6 text-sm text-gray-600 md:text-base">
              <li>
                You are responsible for maintaining the security of your
                account.
              </li>
              <li>
                You are responsible for all activities that occur under your
                account.
              </li>
              <li>
                You can request account deletion at any time by contacting
                teamforum@gmail.com.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Usage Limits
            </h2>
            <ul className="mt-2 list-disc pl-6 text-sm text-gray-600 md:text-base">
              <li>Accounts have limited exports and workflows.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Account Termination
            </h2>
            <p className="mb-2 text-sm text-gray-600 md:text-base">
              We will terminate your account upon request within 30 days.
            </p>
            <p className="text-sm text-gray-600 md:text-base">
              We may also terminate accounts that:
            </p>
            <ul className="mt-2 list-disc pl-6 text-sm text-gray-600 md:text-base">
              <li>Abuse or misuse our service.</li>
              <li>Violate these terms.</li>
              <li>Engage in fraudulent activity.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Your Content
            </h2>
            <ul className="mt-2 list-disc pl-6 text-sm text-gray-600 md:text-base">
              <li>You retain all rights to your content that you post.</li>
              <li>We only process content you explicitly choose to upload.</li>
              <li>
                You are responsible for ensuring you have the right to upload
                and use the content.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Changes to Terms
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              We may update these terms from time to time. We will notify you of
              any significant changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
