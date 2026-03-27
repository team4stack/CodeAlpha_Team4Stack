export type ContentEditorRow = {
  id?: number;
  title?: string;
  description?: string;
  role_text?: string;
  image_url?: string;
  thumbnail_url?: string;
  is_head?: boolean;
  profile_image_url?: string;
  banner_image_url?: string;
  portfolio_url?: string;
  github_url?: string;
  primary_tag?: string;
  order_index?: number;
  active?: boolean;
  level?: string;
  duration?: string;
  price?: string;
  note?: string;
  features?: string;
  gradient?: string;
  emoji?: string;
  gradient_color?: string;
  contact?: string;
};

export const createEmptyContentEditorRow = (): ContentEditorRow => ({
  title: '',
  description: '',
  role_text: '',
  image_url: '',
  thumbnail_url: '',
  is_head: false,
  profile_image_url: '',
  banner_image_url: '',
  portfolio_url: '',
  github_url: '',
  primary_tag: '',
  order_index: undefined,
  active: true,
  level: '',
  duration: '',
  price: '',
  note: '',
  features: '',
  emoji: '',
  gradient_color: '',
  contact: ''
});
