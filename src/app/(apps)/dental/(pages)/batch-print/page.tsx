import { redirect } from 'next/navigation'

// batch-printはdocument-listに統合されました
export default function Page() {
  redirect('/dental/document-list')
}
