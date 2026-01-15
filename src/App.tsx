import { useState, useEffect } from 'react';
import { LostFoundItem, LostFoundItemInput } from './types';
import { subscribeToLostFoundItems, deleteLostFoundItem, updateLostFoundItem, addLostFoundItem, getLostFoundItems } from './services/database';
import { uploadImage, deleteImage } from './services/storage';
import ItemCard from './components/ItemCard';
import ItemForm from './components/ItemForm';
import { FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';

function App() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to refresh items
  const refreshItems = async () => {
    setLoading(true);
    try {
      const updatedItems = await getLostFoundItems();
      setItems(updatedItems);
    } catch (error) {
      console.error('Error refreshing items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLostFoundItems((updatedItems) => {
      setItems(updatedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and search items
  useEffect(() => {
    let filtered = items;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter);
    }

    // Filter by status (only show active by default, or show all if explicitly filtered)
    filtered = filtered.filter(item => item.status === 'active' || filter === 'all');

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [items, filter, searchQuery]);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: LostFoundItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const item = items.find(i => i.id === id);
      if (item?.imageUrl) {
        await deleteImage(item.imageUrl);
      }
      await deleteLostFoundItem(id);
      // Refresh items list after deletion
      await refreshItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, status: LostFoundItem['status']) => {
    try {
      await updateLostFoundItem(id, { status });
      // Refresh items list after status update
      await refreshItems();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleSubmitForm = async (data: LostFoundItemInput) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update existing item
        const updates: Partial<LostFoundItem> = {
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          contactInfo: data.contactInfo,
        };

        // Handle image update
        if (data.image) {
          // Delete old image if exists
          if (editingItem.imageUrl) {
            await deleteImage(editingItem.imageUrl);
          }
          // Upload new image
          const imageUrl = await uploadImage(data.image, editingItem.id);
          updates.imageUrl = imageUrl;
        }

        await updateLostFoundItem(editingItem.id, updates);
      } else {
        // Create new item
        // First, create a temporary ID for image upload
        const tempId = `temp_${Date.now()}`;
        let imageUrl: string | undefined;

        // Upload image if provided
        if (data.image) {
          imageUrl = await uploadImage(data.image, tempId);
        }

        // Add item to database
        await addLostFoundItem({
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          contactInfo: data.contactInfo,
          imageUrl,
          status: 'active',
        });
      }

      // Refresh items list immediately after successful submission
      await refreshItems();

      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    if (!isSubmitting) {
      setShowForm(false);
      setEditingItem(null);
    }
  };

  const lostCount = items.filter(i => i.type === 'lost' && i.status === 'active').length;
  const foundCount = items.filter(i => i.type === 'found' && i.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔔 Lost & Found Board</h1>
              <p className="mt-1 text-sm text-gray-600">
                Help reconnect lost items with their owners
              </p>
            </div>
            <button
              onClick={handleAddItem}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
            >
              <FaPlus />
              Post Item
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-red-50 p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{lostCount}</div>
            <div className="text-sm text-gray-600">Lost Items</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{foundCount}</div>
            <div className="text-sm text-gray-600">Found Items</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('lost')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  filter === 'lost'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setFilter('found')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  filter === 'found'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Found
              </button>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'No items found matching your search.' : 'No items posted yet. Be the first to post!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <ItemForm
          item={editingItem || undefined}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>Lost & Found Board ETC by phuwasit wantaya</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
