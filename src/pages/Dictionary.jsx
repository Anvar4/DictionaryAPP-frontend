// ...existing code...
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import { FiRefreshCw } from 'react-icons/fi';
import DictionaryActions from '@/components/DictionaryActions';
import Sidebar from '@/components/Sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import API from '@/utils/api';

function Dictionary() {
  const [previewImage, setPreviewImage] = useState(null);
  const [activeSection, setActiveSection] = useState('lugat');
  const [dictionaries, setDictionaries] = useState([]);
  const [activeTab, setActiveTab] = useState('tarixiy');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDictName, setNewDictName] = useState('');
  const [newDictType, setNewDictType] = useState('tarixiy');
  const [addLoading, setAddLoading] = useState(false);
  const [newDictImage, setNewDictImage] = useState('');
  const [newDictImageFile, setNewDictImageFile] = useState(null);
  const [newDictImageUploading, setNewDictImageUploading] = useState(false);
  const [newDictDesc, setNewDictDesc] = useState('');
  const [editRowId, setEditRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const getDictionaries = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dictionaries');
      setDictionaries(res.data);
      toast.success('Lug‘atlar muvaffaqiyatli yuklandi!');
    } catch (error) {
      toast.error(
        '❌ Lug‘atlarni olishda xatolik: ' +
          (error.response?.data?.message ||
            error.message ||
            'Xatolik yuz berdi')
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Show add modal
  const openAddModal = () => {
    setNewDictName('');
    setNewDictType(activeTab);
    setNewDictImage('');
    setNewDictImageFile(null);
    setNewDictImageUploading(false);
    setNewDictDesc('');
    setShowAddModal(true);
  };
  const handleAddDictionary = async e => {
    e.preventDefault();
    if (!newDictName.trim()) {
      toast.error('Lug‘at nomi kiritilishi shart!');
      return;
    }
    if (
      dictionaries.some(
        d => d.name.trim().toLowerCase() === newDictName.trim().toLowerCase()
      )
    ) {
      toast.error('Bu nom bilan lug‘at mavjud!');
      return;
    }
    setAddLoading(true);
    let imageUrl = newDictImage;
    try {
      if (newDictImageFile) {
        setNewDictImageUploading(true);
        const formData = new FormData();
        formData.append('file', newDictImageFile);
        const uploadRes = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
        setNewDictImage(imageUrl);
        setNewDictImageUploading(false);
      }
      const payload = {
        name: newDictName,
        type: newDictType,
        imageUrl: imageUrl || undefined,
        description: newDictDesc || undefined,
      };
      const res = await API.post('/dictionaries', payload);
      setDictionaries(prev => [res.data, ...prev]);
      // If new dictionary type is not the current tab, switch to it
      if (activeTab !== newDictType) setActiveTab(newDictType);
      toast.success('Yangi lug‘at qo‘shildi!');
      setShowAddModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lug‘at qo‘shishda xatolik!');
      setNewDictImageUploading(false);
    } finally {
      setAddLoading(false);
    }
  };

  useEffect(() => {
    getDictionaries();
  }, []);
  const filteredDictionaries = dictionaries.filter(
    item => item.type === activeTab
  );

  // Search handler
  const handleSearch = e => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    const results = dictionaries.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
    if (results.length === 0) {
      toast.info('Hech narsa topilmadi.');
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleLogout={handleLogout}
        />
        {/* Content */}
        <main className="flex-1 p-6 bg-white flex flex-col">
          {/* Tabs */}

          <div className="flex justify-between items-center mb-4 w-full max-w-4xl mx-auto">
            <label className="text-2xl font-bold">Lug'atlar</label>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="tarixiy">Tarixiy lug‘atlar</TabsTrigger>
                <TabsTrigger value="zamonaviy">Zamonaviy lug‘atlar</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Lug‘at nomini qidiring..."
                  className="border rounded px-2 py-1 text-sm"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    if (!e.target.value) setSearchResults(null);
                  }}
                  style={{ minWidth: 180 }}
                />
                <Button type="submit" size="sm">
                  Qidirish
                </Button>
              </form>
              <Button className="h-8 p-3" onClick={openAddModal}>
                + Lug‘at qo‘shish
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Yangilash"
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="text-xl" />
              </Button>
            </div>
          </div>
          {/* Add Dictionary Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
                <button
                  className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Yangi lug‘at qo‘shish
                </h2>
                <form onSubmit={handleAddDictionary} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Lug‘at nomi
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={newDictName}
                      onChange={e => setNewDictName(e.target.value)}
                      disabled={addLoading}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Lug‘at turi
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={newDictType}
                      onChange={e => setNewDictType(e.target.value)}
                      disabled={addLoading}
                    >
                      <option value="tarixiy">Tarixiy</option>
                      <option value="zamonaviy">Zamonaviy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Rasm (ixtiyoriy)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border rounded px-3 py-2"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setNewDictImageFile(e.target.files[0]);
                          setNewDictImage('');
                        }
                      }}
                      disabled={addLoading || newDictImageUploading}
                    />
                    {newDictImageUploading && (
                      <div className="flex items-center gap-2 text-blue-500 text-sm mt-1">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Rasm yuklanmoqda...
                      </div>
                    )}
                    {newDictImage && (
                      <div className="flex justify-center mt-2">
                        <img
                          src={newDictImage}
                          alt="Yuklangan rasm"
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Tavsif (ixtiyoriy)
                    </label>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      value={newDictDesc}
                      onChange={e => setNewDictDesc(e.target.value)}
                      disabled={addLoading}
                      placeholder="Lug‘at haqida qisqacha..."
                      rows={2}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addLoading}
                  >
                    {addLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Yuklanmoqda...
                      </span>
                    ) : (
                      'Qo‘shish'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
          {/* Jadval */}
          <div className="border rounded-lg w-full max-w-4xl mx-auto overflow-visible">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 w-1.5 border text-center align-middle">
                    T/R
                  </th>
                  <th className="p-3 border text-center align-middle">Nomi</th>
                  <th className="p-3 border text-center align-middle">Rasm</th>
                  <th className="p-3 border text-center align-middle">
                    Tavsif
                  </th>
                  <th className="p-3 border text-center align-middle">Yana</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center">
                      <span className="flex justify-center items-center gap-2">
                        <svg
                          className="animate-spin h-6 w-6 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Yuklanmoqda...
                      </span>
                    </td>
                  </tr>
                ) : (
                  (searchResults || filteredDictionaries).map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-gray-50 relative"
                    >
                      <td className="p-3 border text-center align-middle">
                        {index + 1}
                      </td>
                      <td className="p-3 border text-center align-middle">
                        {item.name}
                      </td>
                      <td className="p-3 border text-center align-middle">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded mx-auto cursor-pointer border"
                            style={{ display: 'inline-block' }}
                            onClick={() => setPreviewImage(item.imageUrl)}
                          />
                        ) : (
                          <span className="text-gray-400">
                            Rasm mavjud emas
                          </span>
                        )}
                      </td>
                      {/* Rasm preview modal */}
                      {previewImage && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                          style={{ backdropFilter: 'blur(2px)' }}
                          onClick={() => setPreviewImage(null)}
                        >
                          <div
                            className="bg-white rounded-xl shadow-lg p-4 relative flex flex-col items-center"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
                              onClick={() => setPreviewImage(null)}
                              aria-label="Yopish"
                            >
                              ×
                            </button>
                            <img
                              src={previewImage}
                              alt="Rasm preview"
                              className="max-w-[80vw] max-h-[70vh] rounded border"
                              style={{
                                boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <td className="p-3 border text-center align-middle">
                        {item.description || (
                          <span className="text-gray-400 italic">
                            Tavsif yo‘q
                          </span>
                        )}
                      </td>
                      <td className="p-3 border text-center align-middle relative">
                        <DictionaryActions
                          item={item}
                          onEdit={dict => {
                            setEditRowId(dict.id || dict._id);
                            setEditName(dict.name);
                            setEditType(dict.type);
                            setEditImage(dict.imageUrl || '');
                            setEditDesc(dict.description || '');
                          }}
                          onDelete={async dict => {
                            try {
                              await API.delete(
                                `/dictionaries/${dict.id || dict._id}`
                              );
                              setDictionaries(prev =>
                                prev.filter(
                                  d =>
                                    d.id !== (dict.id || dict._id) &&
                                    d._id !== (dict.id || dict._id)
                                )
                              );
                              toast.success('Lug‘at o‘chirildi!');
                            } catch (err) {
                              toast.error(
                                err.response?.data?.message ||
                                  'O‘chirishda xatolik!'
                              );
                            }
                          }}
                        />
                      </td>
                      {/* Tahrirlash modal */}
                      {editRowId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                          <div
                            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
                              onClick={() => setEditRowId(null)}
                              disabled={editLoading}
                            >
                              ×
                            </button>
                            <h2 className="text-xl font-bold mb-4 text-center">
                              Lug‘atni tahrirlash
                            </h2>
                            <form
                              onSubmit={async e => {
                                e.preventDefault();
                                if (!editName.trim()) {
                                  toast.error('Lug‘at nomi kiritilishi shart!');
                                  return;
                                }
                                setEditLoading(true);
                                try {
                                  const res = await API.put(
                                    `/dictionaries/${editRowId}`,
                                    {
                                      name: editName,
                                      type: editType,
                                      imageUrl: editImage || undefined,
                                      description: editDesc || undefined,
                                    }
                                  );
                                  setDictionaries(prev =>
                                    prev.map(d =>
                                      d.id === editRowId ? res.data : d
                                    )
                                  );
                                  toast.success('Lug‘at yangilandi!');
                                  setEditRowId(null);
                                } catch (err) {
                                  toast.error(
                                    err.response?.data?.message ||
                                      'Yangilashda xatolik!'
                                  );
                                } finally {
                                  setEditLoading(false);
                                }
                              }}
                              className="space-y-4"
                            >
                              <div>
                                <label className="block mb-1 font-medium">
                                  Lug‘at nomi
                                </label>
                                <input
                                  className="w-full border rounded px-3 py-2"
                                  value={editName}
                                  onChange={e => setEditName(e.target.value)}
                                  disabled={editLoading}
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">
                                  Lug‘at turi
                                </label>
                                <select
                                  className="w-full border rounded px-3 py-2"
                                  value={editType}
                                  onChange={e => setEditType(e.target.value)}
                                  disabled={editLoading}
                                >
                                  <option value="tarixiy">Tarixiy</option>
                                  <option value="zamonaviy">Zamonaviy</option>
                                </select>
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">
                                  Rasm (ixtiyoriy)
                                </label>
                                {editImage ? (
                                  <div className="flex justify-center mb-2">
                                    <img
                                      src={editImage}
                                      alt="Rasm preview"
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-400 mb-2">
                                    Rasm mavjud emas
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="w-full border rounded px-3 py-2"
                                  onChange={async e => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      try {
                                        setEditLoading(true);
                                        const uploadRes = await API.post(
                                          '/upload',
                                          formData,
                                          {
                                            headers: {
                                              'Content-Type':
                                                'multipart/form-data',
                                            },
                                          }
                                        );
                                        setEditImage(uploadRes.data.url);
                                      } catch {
                                        toast.error('Rasm yuklashda xatolik!');
                                      } finally {
                                        setEditLoading(false);
                                      }
                                    }
                                  }}
                                  disabled={editLoading}
                                />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">
                                  Tavsif (ixtiyoriy)
                                </label>
                                <textarea
                                  className="w-full border rounded px-3 py-2"
                                  value={editDesc}
                                  onChange={e => setEditDesc(e.target.value)}
                                  disabled={editLoading}
                                  placeholder="Tavsif (ixtiyoriy)"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="submit"
                                  className="w-1/2"
                                  disabled={editLoading}
                                >
                                  {editLoading && (
                                    <svg
                                      className="animate-spin h-4 w-4 inline mr-1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                      ></path>
                                    </svg>
                                  )}
                                  Saqlash
                                </Button>
                                <Button
                                  type="button"
                                  className="w-1/2"
                                  variant="outline"
                                  onClick={() => setEditRowId(null)}
                                  disabled={editLoading}
                                >
                                  Bekor
                                </Button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dictionary;
