import { redirect } from 'next/navigation';

// Legacy route — canonical URL is now /matches
export default function PredictionsPage() {
  redirect('/matches');
}
