import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import { FiRefreshCw, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import API from '@/utils/api';

function Category() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [activeSection, setActiveSection] = useState('kategoriyalar');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortType, setSortType] = useState('createdAt');
  const handleSortChange = e => {
    setSortType(e.target.value);
  };

  // Add/Edit form states
  const [catName, setCatName] = useState('');
  const [catDict, setCatDict] = useState('');
  const [catDept, setCatDept] = useState('');
  const [editCatId, setEditCatId] = useState(null);

  // For delete modal
  const [deleteCatId, setDeleteCatId] = useState(null);

  // For ... menu
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    getCategories();
    getDepartments();
    getDictionaries();
  }, []);

  const getCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Kategoriyalarni olishda xatolik');
    }
  };

  const getDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(
        Array.isArray(res.data) ? res.data : res.data.departments || []
      );
    } catch {
      toast.error("Bo'limlarni olishda xatolik");
    }
  };

  const getDictionaries = async () => {
    try {
      const res = await API.get('/dictionaries');
      setDictionaries(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Lug'atlarni olishda xatolik");
    }
  };

  // Search
  const handleSearch = e => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    const results = categories.filter(item =>
      item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    setSearchResults(results);
  };

  // Add Category
  const handleAddCategory = async e => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Kategoriya nomi kiritilishi shart!');
      return;
    }
    if (!catDict) {
      toast.error("Lug'at tanlanishi shart!");
      return;
    }
    if (!catDept) {
      toast.error("Bo'lim tanlanishi shart!");
      return;
    }
    setAddLoading(true);
    try {
      const payload = {
        name: catName,
        dictionary: catDict,
        department: catDept,
      };
      const res = await API.post('/categories', payload);
      setCategories(prev => [res.data, ...prev]);
      toast.success("Kategoriya qo'shildi!");
      setShowAddModal(false);
      setCatName('');
      setCatDict('');
      setCatDept('');
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Kategoriya qo'shishda xatolik!"
      );
    } finally {
      setAddLoading(false);
    }
  };

  // Edit Category
  const openEditModal = cat => {
    setEditCatId(cat._id);
    setCatName(cat.name);
    setCatDict(cat.dictionary);
    setCatDept(cat.department);
    setShowEditModal(true);
  };
  const filteredCategoriesRaw =
    searchResults !== null ? searchResults : categories;
  const filteredCategories = Array.isArray(filteredCategoriesRaw)
    ? filteredCategoriesRaw
    : [];
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortType === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt); // oxirgi qo'shilganlar yuqorida
    }
    if (sortType === 'alphabet') {
      return a.name.localeCompare(b.name, 'uz');
    }
    return 0;
  });
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditCategory = async e => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Kategoriya nomi kiritilishi shart!');
      return;
    }
    if (!catDict) {
      toast.error("Lug'at tanlanishi shart!");
      return;
    }
    if (!catDept) {
      toast.error("Bo'lim tanlanishi shart!");
      return;
    }
    setEditLoading(true);
    try {
      const payload = {
        name: catName,
        dictionary: catDict,
        department: catDept,
      };
      const res = await API.put(`/categories/${editCatId}`, payload);
      setCategories(prev =>
        prev.map(c => (c._id === editCatId ? res.data : c))
      );
      toast.success('Kategoriya tahrirlandi!');
      setShowEditModal(false);
      setEditCatId(null);
      setCatName('');
      setCatDict('');
      setCatDept('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tahrirlashda xatolik!');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Category
  const openDeleteModal = catId => {
    setDeleteCatId(catId);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/categories/${deleteCatId}`);
      setCategories(prev => prev.filter(c => c._id !== deleteCatId));
      toast.success("Kategoriya o'chirildi!");
      setShowDeleteModal(false);
      setDeleteCatId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "O'chirishda xatolik!");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper: get dictionary and department info
  const getDictObj = id =>
    dictionaries.find(d => (d._id || d.id) === (id?._id || id?.id || id)) || {};
  const getDeptObj = id =>
    departments.find(d => (d._id || d.id) === (id?._id || id?.id || id)) || {};

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex h-screen">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleLogout={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        />
        <main className="flex-1 p-6 bg-white flex ju flex-col">
          <div className="flex justify-between items-center mb-4 w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center gap-2">
              <div onSubmit={handleSearch} className=" flex items-center gap-1">
                <label className="text-2xl mr-2 items-center font-bold">
                  Kategoriyalar
                </label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={sortType}
                  onChange={handleSortChange}
                  style={{ minWidth: 160 }}
                >
                  <option value="createdAt">Vaqt bo'yicha tartiblash</option>
                  <option value="alphabet">Alifbo bo'yicha tartiblash</option>
                </select>
              </div>
              {/* Tartiblash select qo'shildi */}

              <input
                type="text"
                placeholder="Kategoriya nomini qidiring..."
                className="border ml-13 rounded px-2 py-1 text-sm"
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
              <Button className="h-8" onClick={() => setShowAddModal(true)}>
                + Kategoriya qo‘shish
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
          <div className="border rounded-lg w-full max-w-4xl mx-auto overflow-visible">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 w-1.5 border text-center align-middle">
                    T/R
                  </th>
                  <th className="p-3 border text-center align-middle">Nomi</th>
                  <th className="p-3 border text-center align-middle">
                    Bo'lim
                  </th>
                  <th className="p-3 border text-center align-middle">
                    Lug'at
                  </th>
                  <th className="p-3 border text-center align-middle">Yana</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="p-3 text-center">
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
                  paginatedCategories.map((item, idx) => {
                    const dept = getDeptObj(item.department);
                    const dict = getDictObj(item.dictionary);
                    return (
                      <tr
                        key={item._id || idx}
                        className="hover:bg-gray-50 relative"
                      >
                        <td className="p-3 border text-center align-middle">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3 border text-center align-middle font-bold">
                          {item.name}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {dept?.name ? (
                            <>
                              {dept.name}
                              {dept.dictio && (
                                <>
                                  {' '}
                                  -{' '}
                                  <span className="text-gray-500">
                                    {getDictObj(dept.dictionary)?.name}
                                    {getDictObj(dept.dictio)?.type ? (
                                      <span className="italic text-xs ml-1">
                                        ({getDictObj(dept.dictionary)?.type})
                                      </span>
                                    ) : (
                                      ''
                                    )}
                                  </span>
                                </>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {dict?.name ? (
                            <>
                              {dict.name}
                              {dict.type && (
                                <span className="italic text-xs ml-1">
                                  ({dict.type})
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle relative">
                          <button
                            className="p-2 rounded hover:bg-gray-200"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === item._id ? null : item._id
                              )
                            }
                          >
                            <FiMoreVertical />
                          </button>
                          {openMenuId === item._id && (
                            <div className="absolute right-0 z-10 bg-white border rounded shadow-md mt-2 w-32">
                              <button
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openEditModal(item);
                                }}
                              >
                                <FiEdit2 /> Tahrirlash
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-red-500"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openDeleteModal(item._id);
                                }}
                              >
                                <FiTrash2 /> O'chirish
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-4">
                <div className="flex gap-3 items-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    &lt;
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Qo'shish Modal */}
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
                  Yangi kategoriya qo'shish
                </h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Nomi</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={catName}
                      onChange={e => setCatName(e.target.value)}
                      autoFocus
                      disabled={addLoading}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Tegishli lug'at
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={catDict}
                      onChange={e => setCatDict(e.target.value)}
                      disabled={addLoading || dictionaries.length === 0}
                    >
                      <option value="">Tanlang</option>
                      {dictionaries.map(dict => (
                        <option
                          key={dict._id || dict.id}
                          value={dict._id || dict.id}
                        >
                          {dict.name} {dict.type ? `(${dict.type})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Lug'atdagi tegishli bo'lim
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={catDept}
                      onChange={e => setCatDept(e.target.value)}
                      disabled={addLoading || departments.length === 0}
                    >
                      <option value="">Tanlang</option>
                      {departments
                        .filter(
                          d =>
                            (d.dictionary?._id ||
                              d.dictionary?.id ||
                              d.dictionary) === catDict
                        )
                        .map(dept => (
                          <option
                            key={dept._id || dept.id}
                            value={dept._id || dept.id}
                          >
                            {dept.name}{' '}
                            {dictionaries.length > 0
                              ? (() => {
                                  const dict = getDictObj(dept.dictionary);
                                  return dict.name
                                    ? `- ${dict.name} ${
                                        dict.type ? `(${dict.type})` : ''
                                      }`
                                    : '';
                                })()
                              : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setShowAddModal(false)}
                      disabled={addLoading}
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={addLoading}
                    >
                      {addLoading ? "Qo'shilmoqda..." : "Qo'shish"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tahrirlash Modal */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
                <button
                  className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Kategoriyani tahrirlash
                </h2>
                <form onSubmit={handleEditCategory} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Nomi</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={catName}
                      onChange={e => setCatName(e.target.value)}
                      autoFocus
                      disabled={editLoading}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Tegishli lug'at
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={catDict}
                      onChange={e => setCatDict(e.target.value)}
                      disabled={editLoading || dictionaries.length === 0}
                    >
                      <option value="">Tanlang</option>
                      {dictionaries.map(dict => (
                        <option
                          key={dict._id || dict.id}
                          value={dict._id || dict.id}
                        >
                          {dict.name} {dict.type ? `(${dict.type})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Lug'atdagi tegishli bo'lim
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={catDept}
                      onChange={e => setCatDept(e.target.value)}
                      disabled={editLoading || departments.length === 0}
                    >
                      <option value="">Tanlang</option>
                      {departments
                        .filter(
                          d =>
                            (d.dictionary?._id ||
                              d.dictionary?.id ||
                              d.dictionary) === catDict
                        )
                        .map(dept => (
                          <option
                            key={dept._id || dept.id}
                            value={dept._id || dept.id}
                          >
                            {dept.name}{' '}
                            {dictionaries.length > 0
                              ? (() => {
                                  const dict = getDictObj(dept.dictionary);
                                  return dict.name
                                    ? `- ${dict.name} ${
                                        dict.type ? `(${dict.type})` : ''
                                      }`
                                    : '';
                                })()
                              : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setShowEditModal(false)}
                      disabled={editLoading}
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={editLoading}
                    >
                      {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* O'chirish Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs relative">
                <button
                  className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  ×
                </button>
                <h2 className="text-lg font-bold mb-4 text-center">
                  Kategoriyani o'chirish
                </h2>
                <p className="mb-6 text-center">
                  Haqiqatan ham ushbu kategoriyani o‘chirilsinmi?
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteLoading}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    variant="destructive"
                    onClick={handleDeleteCategory}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "O'chirilmoqda..." : "O'chirish"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Category;
