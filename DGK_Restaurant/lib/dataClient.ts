import {
  API_PROVIDER,
  MENU_COLLECTION,
  PARSE_APP_ID,
  PARSE_REST_KEY,
  PARSE_SERVER_URL,
  SUPABASE_API_KEY,
  SUPABASE_URL,
  TEAM_COLLECTION,
  UNIT_COLLECTION,
} from './config';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  unit?: string;
  available?: boolean;
};

export type MenuPayload = {
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  unit?: string;
};

export type Unit = {
  id: string;
  name: string;
  city?: string;
  address?: string;
  description?: string;
  phone?: string;
  weatherLocation?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  unitId?: string;
};

export type DataClient = {
  listMenu: () => Promise<MenuItem[]>;
  createMenu: (payload: MenuPayload) => Promise<MenuItem>;
  updateMenu: (id: string, payload: Partial<MenuPayload>) => Promise<MenuItem>;
  deleteMenu: (id: string) => Promise<void>;
  listUnits: () => Promise<Unit[]>;
  listTeam: () => Promise<TeamMember[]>;
};

function normalizeRecord(record: Record<string, any>): Record<string, any> & { id: string } {
  return { ...record, id: record.objectId ?? record.id };
}

async function parseRequest<T>(path: string, options: RequestInit & { body?: unknown } = {}): Promise<T> {
  if (!PARSE_SERVER_URL || !PARSE_APP_ID || !PARSE_REST_KEY) {
    throw new Error('Configure as variáveis do Back4App/Parse antes de continuar.');
  }

  const baseUrl = PARSE_SERVER_URL.endsWith('/') ? PARSE_SERVER_URL.slice(0, -1) : PARSE_SERVER_URL;

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'X-Parse-Application-Id': PARSE_APP_ID,
      'X-Parse-REST-API-Key': PARSE_REST_KEY,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Erro ao comunicar com o Parse.');
  }
  return data as T;
}

async function supabaseRequest<T>(path: string, options: RequestInit & { query?: string } = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error('Configure as variáveis do Supabase antes de utilizar este provedor.');
  }

  const query = options.query ? `?${options.query}` : '';
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}${query}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    const message = Array.isArray(data) ? JSON.stringify(data) : data?.message ?? 'Erro no Supabase.';
    throw new Error(message);
  }
  return data as T;
}

const parseClient: DataClient = {
  async listMenu() {
    const response = await parseRequest<{ results: Record<string, any>[] }>(`/classes/${MENU_COLLECTION}`);
    return response.results.map((record) => normalizeRecord(record) as MenuItem);
  },
  async createMenu(payload) {
    const record = await parseRequest<Record<string, any>>(`/classes/${MENU_COLLECTION}`, {
      method: 'POST',
      body: payload,
    });
    return normalizeRecord({ ...payload, ...record }) as MenuItem;
  },
  async updateMenu(id, payload) {
    const record = await parseRequest<Record<string, any>>(`/classes/${MENU_COLLECTION}/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return normalizeRecord({ ...payload, ...record, objectId: id }) as MenuItem;
  },
  async deleteMenu(id) {
    await parseRequest(`/classes/${MENU_COLLECTION}/${id}`, { method: 'DELETE' });
  },
  async listUnits() {
    const response = await parseRequest<{ results: Record<string, any>[] }>(`/classes/${UNIT_COLLECTION}`);
    return response.results.map((record) => normalizeRecord(record) as Unit);
  },
  async listTeam() {
    const response = await parseRequest<{ results: Record<string, any>[] }>(`/classes/${TEAM_COLLECTION}`);
    return response.results.map((record) => normalizeRecord(record) as TeamMember);
  },
};

const supabaseClient: DataClient = {
  async listMenu() {
    const records = await supabaseRequest<Record<string, any>[]>(MENU_COLLECTION, { query: 'select=*' });
    return records.map((record) => normalizeRecord(record) as MenuItem);
  },
  async createMenu(payload) {
    const [record] = await supabaseRequest<Record<string, any>[]>(MENU_COLLECTION, {
      method: 'POST',
      body: payload,
    });
    return normalizeRecord(record) as MenuItem;
  },
  async updateMenu(id, payload) {
    const [record] = await supabaseRequest<Record<string, any>[]>(`${MENU_COLLECTION}?id=eq.${id}`, {
      method: 'PATCH',
      body: payload,
    });
    return normalizeRecord(record) as MenuItem;
  },
  async deleteMenu(id) {
    await supabaseRequest(`${MENU_COLLECTION}?id=eq.${id}`, { method: 'DELETE' });
  },
  async listUnits() {
    const records = await supabaseRequest<Record<string, any>[]>(UNIT_COLLECTION, { query: 'select=*' });
    return records.map((record) => normalizeRecord(record) as Unit);
  },
  async listTeam() {
    const records = await supabaseRequest<Record<string, any>[]>(TEAM_COLLECTION, { query: 'select=*' });
    return records.map((record) => normalizeRecord(record) as TeamMember);
  },
};

export const dataClient: DataClient = API_PROVIDER === 'supabase' ? supabaseClient : parseClient;
