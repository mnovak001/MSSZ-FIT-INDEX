'use server';

import { MaterialKind, TopicScope } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { saveMaterialFile } from '@/lib/storage';
import { auth } from '@/auth';

// Schema validation with security constraints
const requiredString = z.string().trim().min(1).max(500);
const optionalString = z.string().trim().max(2000).optional();
const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const safeUuid = z.string().regex(uuidRegex, { message: "Invalid UUID format" });

/**
 * Verify admin authentication before allowing action
 */
async function requireAdmin(): Promise<{ id: string; role: string }> {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  return {
    id: session.user.id,
    role: session.user.role
  };
}

export async function createTopic(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const schema = z.object({
    title: requiredString,
    description: optionalString,
    scope: z.nativeEnum(TopicScope)
  });
  
  const data = schema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    scope: formData.get('scope')
  });
  
  await prisma.topic.create({ data });
  revalidatePath('/okruhy');
  redirect('/admin/okruhy');
}

export async function createSpecialization(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const rawCode = String(formData.get('code')).trim();
  const code = rawCode.toUpperCase();
  
  // Validate code format
  if (!/^[A-Z0-9\-_]+$/.test(code)) {
    throw new Error("Code can only contain uppercase letters, numbers, dashes and underscores");
  }
  
  if (code.length < 1 || code.length > 50) {
    throw new Error("Code must be between 1 and 50 characters");
  }
  
  const schema = z.object({
    name: requiredString,
    description: optionalString
  });
  
  const result = schema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')
  });
  
  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }
  
  const data = {
    ...result.data,
    code
  };
  
  await prisma.specialization.create({ data });
  revalidatePath('/specializace');
  redirect('/admin/specializace');
}

export async function createExamVersion(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const schema = z.object({
    name: requiredString,
    academicYear: z.string().trim().max(9).optional(), // e.g., "2024/2025"
    isActive: z.coerce.boolean().default(false)
  });
  
  const data = schema.parse({
    name: formData.get('name'),
    academicYear: formData.get('academicYear'),
    isActive: formData.get('isActive') === 'on'
  });
  
  if (data.isActive) {
    await prisma.examVersion.updateMany({ data: { isActive: false } });
  }
  
  await prisma.examVersion.create({ data });
  revalidatePath('/admin');
  redirect('/admin');
}

export async function mapTopicToSpecialization(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const schema = z.object({
    examVersionId: safeUuid,
    specializationId: safeUuid,
    topicId: safeUuid,
    position: z.coerce.number().int().positive().max(1000),
    specializationNote: optionalString
  });
  
  const data = schema.parse({
    examVersionId: formData.get('examVersionId'),
    specializationId: formData.get('specializationId'),
    topicId: formData.get('topicId'),
    position: formData.get('position'),
    specializationNote: formData.get('specializationNote')
  });
  
  await prisma.specializationTopic.create({ data });
  revalidatePath('/specializace');
  redirect('/admin/mapovani');
}

export async function createMaterial(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const schema = z.object({
    topicId: safeUuid,
    title: requiredString,
    kind: z.nativeEnum(MaterialKind),
    url: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return null;
        return String(val).trim();
      },
      z.string().url().nullable().optional()
    ),
    content: optionalString.nullable(),
    description: optionalString.nullable()
  });
  
  const parsed = schema.parse({
    topicId: formData.get('topicId'),
    title: formData.get('title'),
    kind: formData.get('kind'),
    url: formData.get('url'),
    content: formData.get('content'),
    description: formData.get('description')
  });
  
  let storageKey: string | undefined;
  const file = formData.get('file');
  
  if (parsed.kind === MaterialKind.FILE && file instanceof File && file.size > 0) {
    // Additional file validation in storage.ts
    storageKey = await saveMaterialFile(file);
  }
  
  await prisma.material.create({
    data: {
      topicId: parsed.topicId,
      title: parsed.title,
      kind: parsed.kind,
      url: parsed.kind === MaterialKind.LINK ? parsed.url : null,
      storageKey: parsed.kind === MaterialKind.FILE ? storageKey : null,
      content: parsed.kind === MaterialKind.NOTE ? parsed.content : null,
      description: parsed.description
    }
  });
  
  revalidatePath('/okruhy');
  redirect('/admin/materialy');
}

export async function deleteMaterial(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const schema = z.object({
    id: safeUuid
  });
  
  const data = schema.parse({
    id: formData.get('id')
  });
  
  await prisma.material.delete({
    where: { id: data.id }
  });
  
  revalidatePath('/admin/materialy');
}

export async function deleteTopic(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const schema = z.object({
    id: safeUuid
  });
  
  const data = schema.parse({
    id: formData.get('id')
  });
  
  await prisma.topic.delete({
    where: { id: data.id }
  });
  
  revalidatePath('/admin/okruhy');
}

export async function deleteSpecialization(formData: FormData) {
  // Authenticate user
  await requireAdmin();
  
  const schema = z.object({
    id: safeUuid
  });
  
  const data = schema.parse({
    id: formData.get('id')
  });
  
  await prisma.specialization.delete({
    where: { id: data.id }
  });
  
  revalidatePath('/admin/specializace');
}