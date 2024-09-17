import ContactForm from './form';
import JoinDiscord from '@/components/shared/join-discord';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <JoinDiscord />
      <ContactForm />
    </div>
  );
}