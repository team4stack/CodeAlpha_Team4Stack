import { supabaseAdmin } from '../../../config/supabase';
import type { ProfileActor } from '../middleware/access';
import { getDeveloperProfileForUser, normalizeEmail } from '../middleware/access';
import type { DeveloperProfile, ProfileConversation, ProfileMessage } from '../types';
import { getPublishedBySlug } from './profileService';

function normalizeBody(body: unknown): string {
  return typeof body === 'string' ? body.trim() : '';
}

export async function startConversation(
  slug: string,
  actor: ProfileActor | null,
  body: { email?: string; name?: string; message: string; subject?: string }
): Promise<{ conversation: ProfileConversation; messages: ProfileMessage[] }> {
  if (!actor || actor.kind !== 'user') {
    throw Object.assign(new Error('Sign in required to message a developer'), { status: 401 });
  }

  const profile = await getPublishedBySlug(slug);
  if (!profile) throw Object.assign(new Error('Developer not found'), { status: 404 });

  const message = normalizeBody(body.message);
  if (message.length < 10 || message.length > 3000) {
    throw Object.assign(new Error('Message must be between 10 and 3000 characters'), { status: 400 });
  }

  const clientEmail = normalizeEmail(actor.email);
  if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    throw Object.assign(new Error('Valid account email is required'), { status: 400 });
  }

  const clientName = body.name?.trim() || undefined;
  const subject = body.subject?.trim() || `Project inquiry for ${profile.name}`;

  const { data: conversation, error: convError } = await supabaseAdmin
    .from('profile_conversations')
    .insert({
      developer_profile_id: profile.id,
      client_user_id: actor.userId,
      client_email: clientEmail,
      client_name: clientName || null,
      subject,
      status: 'open',
    })
    .select()
    .single();
  if (convError) throw convError;

  const { data: msg, error: msgError } = await supabaseAdmin
    .from('profile_messages')
    .insert({
      conversation_id: conversation.id,
      sender_kind: 'client',
      sender_user_id: actor.userId,
      sender_email: clientEmail,
      body: message,
    })
    .select()
    .single();
  if (msgError) throw msgError;

  return {
    conversation: conversation as ProfileConversation,
    messages: [msg as ProfileMessage],
  };
}

async function canAccessConversation(
  conversationId: number,
  actor: ProfileActor
): Promise<{ conversation: ProfileConversation; profile: DeveloperProfile } | null> {
  const { data: conversation, error } = await supabaseAdmin
    .from('profile_conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();
  if (error) throw error;
  if (!conversation) return null;

  const { data: profile, error: pErr } = await supabaseAdmin
    .from('developer_profiles')
    .select('*')
    .eq('id', conversation.developer_profile_id)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!profile) return null;

  if (actor.kind === 'user') {
    const email = normalizeEmail(actor.email);
    const isClient =
      conversation.client_user_id === actor.userId ||
      normalizeEmail(conversation.client_email) === email;
    const isDev =
      profile.user_id === actor.userId ||
      normalizeEmail(profile.user_email || '') === email;
    if (isClient || isDev) return { conversation: conversation as ProfileConversation, profile: profile as DeveloperProfile };
  }
  return null;
}

export async function listMessagesForConversation(
  conversationId: number,
  actor: ProfileActor
): Promise<ProfileMessage[]> {
  const access = await canAccessConversation(conversationId, actor);
  if (!access) throw Object.assign(new Error('Conversation not found'), { status: 404 });

  const { data, error } = await supabaseAdmin
    .from('profile_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as ProfileMessage[];
}

export async function replyToConversation(
  conversationId: number,
  actor: ProfileActor,
  body: string
): Promise<ProfileMessage> {
  const text = normalizeBody(body);
  if (text.length < 1 || text.length > 3000) {
    throw Object.assign(new Error('Message must be between 1 and 3000 characters'), { status: 400 });
  }

  const access = await canAccessConversation(conversationId, actor);
  if (!access) throw Object.assign(new Error('Conversation not found'), { status: 404 });
  if (actor.kind !== 'user') {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const email = normalizeEmail(actor.email);
  const isDeveloper =
    access.profile.user_id === actor.userId ||
    normalizeEmail(access.profile.user_email || '') === email;
  const isClient =
    access.conversation.client_user_id === actor.userId ||
    normalizeEmail(access.conversation.client_email) === email;

  if (!isDeveloper && !isClient) {
    throw Object.assign(new Error('Conversation not found'), { status: 404 });
  }

  const senderKind = isDeveloper ? 'developer' : 'client';

  const { data, error } = await supabaseAdmin
    .from('profile_messages')
    .insert({
      conversation_id: conversationId,
      sender_kind: senderKind,
      sender_user_id: actor.userId,
      sender_email: email,
      body: text,
    })
    .select()
    .single();
  if (error) throw error;

  await supabaseAdmin
    .from('profile_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data as ProfileMessage;
}

export type ConversationListItem = ProfileConversation & {
  developer?: { id: number; slug: string; name: string; role?: string; image_url?: string };
  last_message?: string;
};

export async function listConversationsForActor(actor: ProfileActor): Promise<ConversationListItem[]> {
  if (actor.kind !== 'user') return [];

  const devProfile = await getDeveloperProfileForUser(actor);
  const email = normalizeEmail(actor.email);
  let query = supabaseAdmin.from('profile_conversations').select('*');

  if (devProfile) {
    query = query.or(
      `developer_profile_id.eq.${devProfile.id},client_user_id.eq.${actor.userId},client_email.eq.${email}`
    );
  } else {
    query = query.or(`client_user_id.eq.${actor.userId},client_email.eq.${email}`);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) throw error;
  const rows = (data || []) as ProfileConversation[];

  const enriched = await Promise.all(
    rows.map(async (row) => {
      const { data: dev } = await supabaseAdmin
        .from('developer_profiles')
        .select('id, slug, name, role, image_url')
        .eq('id', row.developer_profile_id)
        .maybeSingle();
      const { data: msgs } = await supabaseAdmin
        .from('profile_messages')
        .select('body')
        .eq('conversation_id', row.id)
        .order('created_at', { ascending: false })
        .limit(1);
      return {
        ...row,
        developer: dev || undefined,
        last_message: msgs?.[0]?.body,
      } as ConversationListItem;
    })
  );
  return enriched;
}
