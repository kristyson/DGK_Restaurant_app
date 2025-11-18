import { Alert } from 'react-native';
import { create } from 'zustand';

import { dataClient, MenuItem, MenuPayload, TeamMember, Unit } from '@/lib/dataClient';
import { weatherLocations } from '@/lib/config';
import { loadWeatherForCity, WeatherInfo } from '@/lib/weather';

const staticUnitOptions = Object.keys(weatherLocations);
const locationOptions = ['TODOS', ...staticUnitOptions];
const categoryOptions = ['Entrada', 'Prato principal', 'Sobremesa', 'Bebida', 'Promoção'];

export type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  unit: string;
  available: boolean;
  applyAllUnits: boolean;
};

export type FiltersState = {
  name: string;
  category: string;
  availability: string;
  minPrice: string;
  maxPrice: string;
};

export type SortConfig = {
  key: 'name' | 'price' | 'unit';
  direction: 'asc' | 'desc';
};

const defaultUnit = staticUnitOptions[0] ?? '';

function createEmptyForm(selectedUnit = defaultUnit): FormData {
  return {
    name: '',
    description: '',
    price: '',
    category: '',
    unit: selectedUnit,
    available: true,
    applyAllUnits: false,
  };
}

type RestaurantState = {
  menuItems: MenuItem[];
  units: Unit[];
  teamMembers: TeamMember[];
  unitOptions: string[];
  filters: FiltersState;
  sortConfig: SortConfig;
  formData: FormData;
  editingId: string | null;
  isSaving: boolean;
  isLoadingMenu: boolean;
  statusMessage: string;
  weatherCity: string;
  weatherInfo: WeatherInfo | null;
  weatherMessage: string;
  isLoadingUnits: boolean;
  unitsLoaded: boolean;
  isLoadingTeam: boolean;
  teamLoaded: boolean;
  categoryOptions: string[];
  locationOptions: string[];
  setWeatherCity: (city: string) => void;
  loadWeather: (city?: string) => Promise<void>;
  loadMenu: () => Promise<void>;
  loadUnits: (force?: boolean) => Promise<void>;
  loadTeam: (force?: boolean) => Promise<void>;
  updateForm: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  updateFilter: <K extends keyof FiltersState>(field: K, value: FiltersState[K]) => void;
  toggleSort: (key: SortConfig['key']) => void;
  submitForm: () => Promise<void>;
  startEdit: (item: MenuItem) => void;
  cancelEdit: () => void;
  toggleAvailability: (item: MenuItem) => Promise<void>;
  deleteItem: (item: MenuItem) => Promise<void>;
};

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  menuItems: [],
  units: [],
  teamMembers: [],
  unitOptions: staticUnitOptions,
  filters: {
    name: '',
    category: 'TODAS',
    availability: 'TODOS',
    minPrice: '',
    maxPrice: '',
  },
  sortConfig: { key: 'unit', direction: 'asc' },
  formData: createEmptyForm(),
  editingId: null,
  isSaving: false,
  isLoadingMenu: false,
  statusMessage: '',
  weatherCity: locationOptions[0],
  weatherInfo: null,
  weatherMessage: 'Selecione uma cidade.',
  isLoadingUnits: false,
  unitsLoaded: false,
  isLoadingTeam: false,
  teamLoaded: false,
  categoryOptions,
  locationOptions,

  setWeatherCity: (city) => {
    set({ weatherCity: city });
    void get().loadWeather(city);
    if (city !== 'TODOS' && !get().editingId) {
      const nextUnit = get().unitOptions.includes(city) ? city : get().unitOptions[0] ?? defaultUnit;
      set((state) => ({ formData: { ...state.formData, unit: nextUnit } }));
    }
  },

  async loadWeather(cityParam) {
    const city = cityParam ?? get().weatherCity;
    if (city === 'TODOS') {
      set({ weatherInfo: null, weatherMessage: 'Selecione uma cidade.' });
      return;
    }
    try {
      const info = await loadWeatherForCity(city as keyof typeof weatherLocations);
      set({ weatherInfo: info, weatherMessage: '' });
    } catch (error) {
      set({
        weatherInfo: null,
        weatherMessage: error instanceof Error ? error.message : 'Erro ao buscar o clima.',
      });
    }
  },

  async loadMenu() {
    set({ isLoadingMenu: true, statusMessage: '' });
    try {
      const menuItems = await dataClient.listMenu();
      set({ menuItems });
    } catch (error) {
      set({ statusMessage: error instanceof Error ? error.message : 'Erro ao carregar cardápio.' });
    } finally {
      set({ isLoadingMenu: false });
    }
  },

  async loadUnits(force) {
    if (get().unitsLoaded && !force) return;
    set({ isLoadingUnits: true });
    try {
      const units = await dataClient.listUnits();
      const fetchedUnits = units.filter((unit) => !!unit.name);
      const fallback = fetchedUnits.length ? fetchedUnits.map((unit) => unit.name!) : staticUnitOptions;
      const normalized = Array.from(new Set(fallback));
      set({
        units,
        unitOptions: normalized,
        formData: get().editingId
          ? get().formData
          : {
              ...get().formData,
              unit: normalized.includes(get().formData.unit)
                ? get().formData.unit
                : normalized[0] ?? defaultUnit,
            },
        unitsLoaded: true,
      });
    } catch (error) {
      set({ statusMessage: error instanceof Error ? error.message : 'Erro ao carregar unidades.' });
    } finally {
      set({ isLoadingUnits: false });
    }
  },

  async loadTeam(force) {
    if (get().teamLoaded && !force) return;
    set({ isLoadingTeam: true });
    try {
      const teamMembers = await dataClient.listTeam();
      set({ teamMembers, teamLoaded: true });
    } catch (error) {
      set({ statusMessage: error instanceof Error ? error.message : 'Erro ao carregar equipe.' });
    } finally {
      set({ isLoadingTeam: false });
    }
  },

  updateForm(field, value) {
    set((state) => ({ formData: { ...state.formData, [field]: value } }));
  },

  updateFilter(field, value) {
    set((state) => ({ filters: { ...state.filters, [field]: value } }));
  },

  toggleSort(key) {
    set((state) =>
      state.sortConfig.key === key
        ? { sortConfig: { key, direction: state.sortConfig.direction === 'asc' ? 'desc' : 'asc' } }
        : { sortConfig: { key, direction: 'asc' } },
    );
  },

  async submitForm() {
    const { formData, weatherCity, unitOptions, editingId } = get();
    const targets = formData.applyAllUnits ? unitOptions : [formData.unit];
    const price = Number(String(formData.price).replace(',', '.'));

    if (!formData.name.trim()) {
      set({ statusMessage: 'Informe um nome.' });
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      set({ statusMessage: 'Preço inválido.' });
      return;
    }
    if (!formData.category) {
      set({ statusMessage: 'Selecione uma categoria.' });
      return;
    }
    if (!formData.applyAllUnits && !formData.unit) {
      set({ statusMessage: 'Selecione uma unidade.' });
      return;
    }

    const basePayload: Omit<MenuPayload, 'unit'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      category: formData.category,
      available: formData.available,
    };

    set({ isSaving: true, statusMessage: '' });

    try {
      if (editingId) {
        await dataClient.updateMenu(editingId, { ...basePayload, unit: formData.unit });
        set({ statusMessage: 'Item atualizado.' });
      } else {
        for (const unit of targets) {
          await dataClient.createMenu({ ...basePayload, unit });
        }
        set({ statusMessage: 'Novo item adicionado.' });
      }

      set({
        formData: createEmptyForm(
          weatherCity !== 'TODOS' && unitOptions.includes(weatherCity) ? weatherCity : unitOptions[0] ?? defaultUnit,
        ),
        editingId: null,
      });
      await get().loadMenu();
    } catch (error) {
      set({ statusMessage: error instanceof Error ? error.message : 'Erro ao salvar.' });
    } finally {
      set({ isSaving: false });
    }
  },

  startEdit(item) {
    set({
      formData: {
        name: item.name ?? '',
        description: item.description ?? '',
        price: item.price != null ? String(item.price) : '',
        category: item.category ?? '',
        unit: item.unit ?? defaultUnit,
        available: item.available !== false,
        applyAllUnits: false,
      },
      editingId: item.id,
      statusMessage: 'Editando item.',
    });
  },

  cancelEdit() {
    set({ editingId: null, formData: createEmptyForm(), statusMessage: 'Edição cancelada.' });
  },

  async toggleAvailability(item) {
    try {
      await dataClient.updateMenu(item.id, { available: item.available === false });
      set({ statusMessage: 'Disponibilidade atualizada.' });
      await get().loadMenu();
    } catch (error) {
      set({ statusMessage: error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade.' });
    }
  },

  async deleteItem(item) {
    return new Promise<void>((resolve) => {
      Alert.alert('Excluir prato', `Deseja remover "${item.name}"?`, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve() },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await dataClient.deleteMenu(item.id);
              set({ statusMessage: 'Item removido.' });
              await get().loadMenu();
            } catch (error) {
              set({ statusMessage: error instanceof Error ? error.message : 'Erro ao excluir.' });
            } finally {
              resolve();
            }
          },
        },
      ]);
    });
  },
}));

export const selectors = {
  categoryOptions: (state: RestaurantState) => state.categoryOptions,
  locationOptions: (state: RestaurantState) => state.locationOptions,
};
