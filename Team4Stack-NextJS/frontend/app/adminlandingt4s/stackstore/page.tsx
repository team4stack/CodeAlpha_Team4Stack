import { redirect } from 'next/navigation'

/** StackStore is managed under /adminstackt4s; this avoids ContentPage "Unknown content type" for old links. */
export default function StackStoreRedirectPage() {
  redirect('/adminstackt4s')
}
