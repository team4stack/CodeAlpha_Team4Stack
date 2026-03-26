export interface DbCourse {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  level?: string;
  duration?: string;
  price?: string;
  note?: string;
  features?: string[];
  gradient?: string;
}

export interface DisplayCourse {
  key: string;
  title: string;
  level: string;
  description: string;
  duration: string;
  price: string;
  note: string;
  features: string[];
  gradient: string;
}
