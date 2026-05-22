import {supabase} from './supabase';
import {SUPABASE_URL, SUPABASE_ANON_KEY} from '@env';

const BUCKET = 'recipe-photos';

export async function uploadPhoto(
  uri: string,
  userId: string,
): Promise<string> {
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const {data: sessionData} = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('Usuário não autenticado');

  const formData = new FormData();
  formData.append('file', {uri, name: `photo.${ext}`, type: mimeType} as any);

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message ?? `Erro ao fazer upload (${response.status})`);
  }

  const {data} = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deletePhoto(photoUrl: string) {
  const urlObj = new URL(photoUrl);
  const pathParts = urlObj.pathname.split(`/object/public/${BUCKET}/`);
  if (pathParts.length < 2) return;
  const filePath = pathParts[1];

  const {error} = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw error;
}
