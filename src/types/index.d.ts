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
