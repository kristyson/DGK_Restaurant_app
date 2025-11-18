import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { Filters } from '@/components/restaurant/Filters';
import { Footer } from '@/components/restaurant/Footer';
import { Header } from '@/components/restaurant/Header';
import { MenuForm } from '@/components/restaurant/MenuForm';
import { MenuTable } from '@/components/restaurant/MenuTable';
import { WeatherSection } from '@/components/restaurant/WeatherSection';
import { layout, palette } from '@/components/restaurant/theme';
import {
  MENU_CLASS,
  loadWeatherForCity,
  parseRequest,
  weatherLocations,
} from '@/lib/parseApi';

const unitOptions = Object.keys(weatherLocations);
const locationOptions = ['TODOS', ...unitOptions];
const defaultCity = locationOptions[0];
const defaultUnit = unitOptions[0] ?? '';
const categoryOptions = ['Entrada', 'Prato principal', 'Sobremesa', 'Bebida', 'Promoção'];

type MenuItem = {
  objectId: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  unit?: string;
  available?: boolean;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  unit: string;
  available: boolean;
  applyAllUnits: boolean;
};

type FiltersState = {
  name: string;
  category: string;
  availability: string;
  minPrice: string;
  maxPrice: string;
};

type SortConfig = {
  key: 'name' | 'price' | 'unit';
  direction: 'asc' | 'desc';
};

function createEmptyForm(selectedUnit: string): FormData {
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

export default function HomeScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState<FormData>(() => createEmptyForm(defaultUnit));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [weatherCity, setWeatherCity] = useState(defaultCity);
  const [weatherInfo, setWeatherInfo] = useState<Awaited<ReturnType<typeof loadWeatherForCity>> | null>(null);
  const [weatherMessage, setWeatherMessage] = useState('');
  const [filters, setFilters] = useState<FiltersState>({
    name: '',
    category: 'TODAS',
    availability: 'TODOS',
    minPrice: '',
    maxPrice: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'unit', direction: 'asc' });

  const selectableCategories = useMemo(() => {
    const combined = new Set(categoryOptions);
    menuItems.forEach((item) => {
      if (item?.category) {
        combined.add(item.category);
      }
    });
    return Array.from(combined);
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (weatherCity !== 'TODOS' && item.unit !== weatherCity) return false;
      if (filters.name && !item.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.category !== 'TODAS' && item.category !== filters.category) return false;
      if (filters.availability !== 'TODOS') {
        const isAvailable = item.available !== false;
        if (filters.availability === 'DISPONIVEL' && !isAvailable) return false;
        if (filters.availability === 'INDISPONIVEL' && isAvailable) return false;
      }
      if (filters.minPrice && typeof item.price === 'number' && item.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && typeof item.price === 'number' && item.price > Number(filters.maxPrice)) return false;
      return true;
    });
  }, [filters, menuItems, weatherCity]);

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    const { key, direction } = sortConfig;
    items.sort((a, b) => {
      const valueA = key === 'price' ? a.price ?? -Infinity : (a[key] ?? '').toString().toLowerCase();
      const valueB = key === 'price' ? b.price ?? -Infinity : (b[key] ?? '').toString().toLowerCase();
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [filteredItems, sortConfig]);

  const totalAvailable = useMemo(
    () => filteredItems.filter((item) => item.available !== false).length,
    [filteredItems],
  );

  useEffect(() => {
    refreshMenu();
  }, []);

  useEffect(() => {
    refreshWeather(weatherCity);
  }, [weatherCity]);

  useEffect(() => {
    if (!editingId) {
      setFormData((prev) => ({
        ...prev,
        unit: unitOptions.includes(weatherCity) ? weatherCity : defaultUnit,
      }));
    }
  }, [editingId, weatherCity]);

  async function refreshMenu() {
    setIsLoadingMenu(true);
    setStatusMessage('');
    try {
      const response = await parseRequest<{ results: MenuItem[] }>(`/classes/${MENU_CLASS}`);
      setMenuItems(Array.isArray(response.results) ? response.results : []);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erro ao carregar cardápio.');
    } finally {
      setIsLoadingMenu(false);
    }
  }

  async function refreshWeather(city: string) {
    if (city === 'TODOS') {
      setWeatherInfo(null);
      setWeatherMessage('Selecione uma cidade.');
      return;
    }

    try {
      const info = await loadWeatherForCity(city as keyof typeof weatherLocations);
      setWeatherInfo(info);
      setWeatherMessage('');
    } catch (error) {
      setWeatherInfo(null);
      setWeatherMessage(error instanceof Error ? error.message : 'Erro ao buscar o clima.');
    }
  }

  function updateForm<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateFilter<K extends keyof FiltersState>(field: K, value: FiltersState[K]) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSort(key: SortConfig['key']) {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  }

  function renderSortIndicator(column: string) {
    if (sortConfig.key !== column) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  }

  async function handleSubmit() {
    setIsSaving(true);
    setStatusMessage('');
    try {
      const price = Number(String(formData.price).replace(',', '.'));
      if (!formData.name.trim()) throw new Error('Informe um nome.');
      if (Number.isNaN(price) || price < 0) throw new Error('Preço inválido.');
      if (!formData.category) throw new Error('Selecione uma categoria.');
      if (!formData.applyAllUnits && !formData.unit) throw new Error('Selecione uma unidade.');

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category,
        available: formData.available,
      };

      if (editingId) {
        await parseRequest(`/classes/${MENU_CLASS}/${editingId}`, {
          method: 'PUT',
          body: { ...payload, unit: formData.unit },
        });
        setStatusMessage('Item atualizado.');
      } else {
        const targets = formData.applyAllUnits ? unitOptions : [formData.unit];
        for (const unit of targets) {
          await parseRequest(`/classes/${MENU_CLASS}`, {
            method: 'POST',
            body: { ...payload, unit },
          });
        }
        setStatusMessage('Novo item adicionado.');
      }

      setFormData(createEmptyForm(unitOptions.includes(weatherCity) ? weatherCity : defaultUnit));
      setEditingId(null);
      refreshMenu();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(item: MenuItem) {
    setFormData({
      name: item.name ?? '',
      description: item.description ?? '',
      price: item.price != null ? String(item.price) : '',
      category: item.category ?? '',
      unit: item.unit ?? defaultUnit,
      available: item.available !== false,
      applyAllUnits: false,
    });
    setEditingId(item.objectId);
    setStatusMessage('Editando item.');
  }

  function handleDelete(item: MenuItem) {
    Alert.alert('Excluir prato', `Deseja remover "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await parseRequest(`/classes/${MENU_CLASS}/${item.objectId}`, { method: 'DELETE' });
            setStatusMessage('Item removido.');
            refreshMenu();
          } catch (error) {
            setStatusMessage(error instanceof Error ? error.message : 'Erro ao excluir.');
          }
        },
      },
    ]);
  }

  async function handleToggleAvailability(item: MenuItem) {
    try {
      await parseRequest(`/classes/${MENU_CLASS}/${item.objectId}`, {
        method: 'PUT',
        body: { available: !(item.available !== false) },
      });
      setStatusMessage('Disponibilidade atualizada.');
      refreshMenu();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade.');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(createEmptyForm(defaultUnit));
    setStatusMessage('Edição cancelada.');
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Header totalItems={menuItems.length} availableItems={totalAvailable} />
        <WeatherSection
          weatherCity={weatherCity}
          setWeatherCity={setWeatherCity}
          locationOptions={locationOptions}
          weatherInfo={weatherInfo}
          weatherMessage={weatherMessage}
        />
        <MenuForm
          editingId={editingId}
          formData={formData}
          selectableCategories={selectableCategories}
          unitOptions={unitOptions}
          updateForm={updateForm}
          handleSubmit={handleSubmit}
          handleCancelEdit={handleCancelEdit}
          isSaving={isSaving}
        />
        <Filters filters={filters} updateFilter={updateFilter} selectableCategories={selectableCategories} />
        <MenuTable
          sortedItems={sortedItems}
          totalAvailable={totalAvailable}
          isLoadingMenu={isLoadingMenu}
          statusMessage={statusMessage}
          refreshMenu={refreshMenu}
          handleEdit={handleEdit}
          handleToggleAvailability={handleToggleAvailability}
          handleDelete={handleDelete}
          toggleSort={toggleSort}
          renderSortIndicator={renderSortIndicator}
        />
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  container: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    gap: layout.spacing,
  },
});
