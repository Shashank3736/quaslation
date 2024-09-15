import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ContactForm from './form';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DISCORD_INVITE_URL } from '@/lib/config';
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