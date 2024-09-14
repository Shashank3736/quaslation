import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ContactForm from './form';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DISCORD_INVITE_URL } from '@/lib/config';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <Alert className='m-4 w-fit'>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Join our Discord Community</AlertTitle>
        <AlertDescription>
          <p className='mb-2'>
            Connect with like-minded individuals, participate in discussions, and stay up-to-date with the latest news and updates.
            You can also request for translation of other novels.
          </p>
          <Button asChild><a href={DISCORD_INVITE_URL}>Join Now</a></Button>
        </AlertDescription>
      </Alert>
      <ContactForm />
    </div>
  );
}