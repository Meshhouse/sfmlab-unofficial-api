type ModelLink = {
  url: string;
  title: string;
  file_size: string;
}

type SFMLabSimpleModel = {
  id: number;
  title: string;
  author: string;
  thumbnail: string;
  extension: string;
  mature_content: boolean;
  created_at: number;
  updated_at: number;
}

type Comment = {
  name: string;
  avatar: string;
  message: string;
  date: number;
}

type SFMLabResponse = {
  models: SFMLabSimpleModel[];
  pagination: {
    page: number;
    totalItems: number;
    totalPages: number;
  }
}

type SFMLabGetModelsQuery = {
  adult_content?: 'included' | 'excluded' | 'only';
  page?: string | number;
  limit?: string | number;
  search?: string;
}

type SFMLabGetSingleModelParams = {
  id: number | string;
}

type SFMLabParserQuery = {
  full_rescan?: boolean | string;
}

type SFMLabV2SimpleModel = {
  pk: number;
  title: string;
  description: string;
  author: {
    pk: number;
    user_id: number;
    profile_name: string;
    username: string;
    verified_uploader: boolean;
    staff: boolean;
    paid_supporter: boolean;
  }
  created: string;
  modified: string;
  published_date: string;
  last_file_date: string;
  views: number;
  popularity: number;
  furry_content: boolean;
  adult_content: boolean;
  item_thumb: string;
}

type SFMLabFeedParams = {
  user: string;
  password: string;
}
