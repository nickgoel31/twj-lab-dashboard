// app/actions/documents.ts
"use server";

import { google } from 'googleapis';
import { Readable } from 'stream';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DocumentType } from '@/lib/generated/prisma';

export async function uploadDocument(formData: FormData) {
  const file = formData.get('file') as File;
  const clientId = formData.get('clientId') as string;

  if (!file || !clientId || file.size === 0) {
    return { success: false, message: 'File and client ID are required.' };
  }

  try {
    // 1. Authenticate with the service account
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS!);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const drive = google.drive({ version: 'v3', auth });
    const folderId = process.env.DRIVE_FOLDER_ID!;

    // 2. Prepare the file for upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileStream = Readable.from(fileBuffer);

    // 3. Create the file on Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
        parents: [folderId], // Specify the folder to upload into
      },
      media: {
        mimeType: file.type,
        body: fileStream,
      },
      fields: 'id', // Request the file ID in the response
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error('File upload failed, no file ID returned.');
    }

    // 4. Make the file publicly readable
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // 5. Get the public URL for the file
    const fileResult = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink', // webViewLink is for viewing, webContentLink is for direct download
    });

    const publicUrl = fileResult.data.webViewLink;
    if (!publicUrl) {
      throw new Error('Could not get public URL for the file.');
    }

    // 6. Save the document metadata to your database
    await prisma.documentVault.create({
      data: {
        clientId,
        name: file.name,
        url: publicUrl,
        type: (file.type.split('/')[1].toUpperCase()) as DocumentType,
      },
    });

    revalidatePath('/clients');
    return { success: true, message: 'Document uploaded successfully.' };

  } catch (error) {
    console.error('Upload failed:', error.message);
    return { success: false, message: 'Failed to upload document.' };
  }
}