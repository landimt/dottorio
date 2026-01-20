import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { shareLinkService } from "@/lib/services/shareLink.service";
import { ShareExamForm } from "./_components/share-exam-form";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const session = await auth();

  const shareLink = await shareLinkService.findBySlug(slug);

  if (!shareLink) {
    notFound();
  }

  // Get all professors for the subject (so user can change)
  const professors = await shareLinkService.getProfessorsBySubject(
    shareLink.exam.subjectId
  );

  return (
    <ShareExamForm
      shareLink={shareLink}
      professors={professors}
      session={session}
    />
  );
}
