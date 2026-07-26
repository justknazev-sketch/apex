import { redirect } from 'next/navigation';

// The constructor is part of the homepage (#constructor section).
// This page redirects there to avoid code duplication.
export default function BuildPage() {
  redirect('/#constructor');
}
