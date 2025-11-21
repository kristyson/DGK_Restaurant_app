import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Filters } from '@/components/restaurant/Filters';
import { Footer } from '@/components/restaurant/Footer';
import { Header } from '@/components/restaurant/Header';
import { MenuForm } from '@/components/restaurant/MenuForm';
import { MenuTable } from '@/components/restaurant/MenuTable';
import { WeatherSection } from '@/components/restaurant/WeatherSection';
import { layout, palette } from '@/components/restaurant/theme';
import { useRestaurantStore } from '@/hooks/useRestaurantStore';

export default function HomeScreen() {
  const menuItems = useRestaurantStore((state) => state.menuItems);
  const filters = useRestaurantStore((state) => state.filters);
  const sortConfig = useRestaurantStore((state) => state.sortConfig);
  const formData = useRestaurantStore((state) => state.formData);
  const editingId = useRestaurantStore((state) => state.editingId);
  const isSaving = useRestaurantStore((state) => state.isSaving);
  const isLoadingMenu = useRestaurantStore((state) => state.isLoadingMenu);
  const statusMessage = useRestaurantStore((state) => state.statusMessage);
  const weatherCity = useRestaurantStore((state) => state.weatherCity);
  const weatherInfo = useRestaurantStore((state) => state.weatherInfo);
  const weatherMessage = useRestaurantStore((state) => state.weatherMessage);
  const unitOptions = useRestaurantStore((state) => state.unitOptions);
  const categoryOptions = useRestaurantStore((state) => state.categoryOptions);
  const locationOptions = useRestaurantStore((state) => state.locationOptions);

  const updateForm = useRestaurantStore((state) => state.updateForm);
  const updateFilter = useRestaurantStore((state) => state.updateFilter);
  const toggleSort = useRestaurantStore((state) => state.toggleSort);
  const submitForm = useRestaurantStore((state) => state.submitForm);
  const cancelEdit = useRestaurantStore((state) => state.cancelEdit);
  const startEdit = useRestaurantStore((state) => state.startEdit);
  const toggleAvailability = useRestaurantStore((state) => state.toggleAvailability);
  const deleteItem = useRestaurantStore((state) => state.deleteItem);
  const loadMenu = useRestaurantStore((state) => state.loadMenu);
  const setWeatherCity = useRestaurantStore((state) => state.setWeatherCity);
  const loadWeather = useRestaurantStore((state) => state.loadWeather);
  const loadUnits = useRestaurantStore((state) => state.loadUnits);

  useEffect(() => {
    void loadMenu();
    void loadUnits();
  }, [loadMenu, loadUnits]);

  useEffect(() => {
    void loadWeather(weatherCity);
  }, [loadWeather, weatherCity]);

  const selectableCategories = useMemo(() => {
    const combined = new Set(categoryOptions);
    menuItems.forEach((item) => {
      if (item?.category) {
        combined.add(item.category);
      }
    });
    return Array.from(combined);
  }, [categoryOptions, menuItems]);

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
          handleSubmit={submitForm}
          handleCancelEdit={cancelEdit}
          isSaving={isSaving}
        />
        <Filters filters={filters} updateFilter={updateFilter} selectableCategories={selectableCategories} />
        <MenuTable
          sortedItems={sortedItems}
          totalAvailable={totalAvailable}
          isLoadingMenu={isLoadingMenu}
          statusMessage={statusMessage}
          refreshMenu={loadMenu}
          handleEdit={startEdit}
          handleToggleAvailability={toggleAvailability}
          handleDelete={deleteItem}
          toggleSort={toggleSort}
          sortConfig={sortConfig}
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
