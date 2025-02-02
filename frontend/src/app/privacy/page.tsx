export default function Privacy() {
  return (
    <div className="flex w-full flex-col ">
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-0 md:py-8">
        <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
          Privacy Policy
        </h1>
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              What We Collect
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              We only collect information that's necessary for ForumAI
            </p>
            <ul className="mt-2 list-disc pl-6 text-sm text-gray-600 md:text-base">
              <li>Your email address for account management.</li>
              <li>Content of posts and uploaded documents.</li>
              <li>Public comments and replies between users.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              How We Store Your Data
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              We use Supabase for store user and course related data. All data
              is stored securely and we only keep what's necessary for the
              service to function.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              How We Use Your Data
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              We use your data solely to:
            </p>
            <ul className="mt-2 list-disc pl-6 text-sm text-gray-600 md:text-base">
              <li>Manage your account.</li>
              <li>
                Deliver personalized AI assistance to enhance your learning
                experience.
              </li>
              <li>Provide technical support.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Data Sharing
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              We don't sell or share your data with third parties. We only
              access uploaded content that you explicitly choose to share.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold md:mb-3 md:text-xl">
              Questions?
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              If you have any questions about our privacy practices, please
              contact us at teamforum@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
