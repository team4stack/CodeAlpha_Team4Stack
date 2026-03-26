import type { ContentEditorRow } from '@/modules/landing/admin/content-editor/types';
import { toFeaturesJson } from '@/modules/landing/admin/content-editor/contentTableCrud';

interface BuildContentRecordPayloadParams {
  form: ContentEditorRow & Record<string, any>;
  isTeamLike: boolean;
  isProjects: boolean;
  isCourses: boolean;
  isServices: boolean;
}

export const buildContentRecordPayload = ({
  form,
  isTeamLike,
  isProjects,
  isCourses,
  isServices
}: BuildContentRecordPayloadParams) => {
  if (isTeamLike) {
    return {
      name: form.title,
      role: form.role_text,
      description: form.description,
      image_url: form.image_url,
      profile_image_url: form.profile_image_url || null,
      banner_image_url: form.banner_image_url || null,
      portfolio_url: form.portfolio_url || null,
      github_url: form.github_url || null,
      primary_tag: form.primary_tag || null,
      order_index: form.order_index ?? null,
      active: form.active !== false,
      is_head: !!form.is_head
    };
  }

  if (isProjects) {
    return {
      title: form.title,
      description: form.description || null,
      video_id: form.video_id || null,
      github_url: form.github_url || null,
      image_url: form.image_url || null,
      order_index: form.order_index ?? null
    };
  }

  if (isCourses) {
    return {
      title: form.title,
      description: form.description,
      level: form.level || null,
      duration: form.duration || null,
      price: form.price || null,
      note: form.note || null,
      features: toFeaturesJson(form.features),
      order_index: form.order_index ?? null,
      active: form.active !== false
    };
  }

  if (isServices) {
    return {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      emoji: form.emoji || null,
      gradient_color: form.gradient_color || null,
      contact: form.contact || null,
      order_index: form.order_index ?? null,
      active: form.active !== false
    };
  }

  return form;
};
