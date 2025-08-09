import ContactForm from './form';
import JoinDiscord from '@/components/shared/join-discord';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="glass rounded-xl border border-white/15 p-8 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gradient-indigo-violet">Contact Us</h1>
        <JoinDiscord />
      </div>
      <div className="glass rounded-xl border border-white/15 p-8 mb-8">
        <ContactForm />
      </div>
      <div className="glass rounded-xl border border-white/15 p-6 text-center">
        <p className='mb-2'>Alternatively You can email us at <a className='text-gradient-indigo-violet font-semibold hover:underline' href="mailto:mail@quaslation.xyz">mail@quaslation.xyz</a></p>
      </div>
    </div>
  );
}